import mongoose from "mongoose";
import { Case } from "../Models/case.model.js";
import { User } from "../Models/User.model.js";
import { Clients } from "../Models/Client.model.js";
import { Lawyers } from "../Models/Lawyer.model.js";
import { fileUploadOnCloudinary, removeFileFromCloudinary } from "../utility/fileUpload_remove.js";
const MAX_STORAGE_BYTES = 20 * 1024 * 1024;

const getResourceType = (mimeType) => {
    if (!mimeType) return "auto";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "raw";
};

// create case
const createCase = async (req, res) => {
    try {
        // get id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // Parse body
        const { caseTitle, caseDescription, caseType, clientId, lawyerId } = req.body;
        console.log(req.body)

        if (!caseTitle || !caseDescription || !caseType || !clientId) {
            return res.status(400).json({ statusCode: 400, message: "all fields are required", });
        }

        // Validate client
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ statusCode: 400, message: "Invalid clientId" });
        }
        const client = await Clients.findById(clientId)
        if (!client) {
            return res.status(400).json({ statusCode: 400, message: "Client is did not found" });
        }

        // Ensure the client belongs to the current user
        if (!user._id.equals(client.user)) {
            return res.status(400).json({ statusCode: 400, message: "This client does not belong to you" });
        }

        // Determine lawyer handling
        let handlingLawyerId = null;
        if (user.role === "Law Firm") {
            // check id 
            if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
                return res.status(400).json({ statusCode: 400, message: "Valid lawyerId is required for Law Firm" });
            }
            // find the lawyer
            const lawyer = await Lawyers.findById(lawyerId);
            if (!lawyer) {
                return res.status(400).json({ statusCode: 400, message: "Lawyer not found" });
            }
            handlingLawyerId = lawyer._id;
        }

        // Gather uploaded files from Multer (field name 'docs')
        const files = Array.isArray(req.files?.docs) ? req.files.docs : [];
        if (!files || files.length < 1) {
            return res.status(400).json({ statusCode: 400, message: "Min 1 file is required" });
        }

        // Compute total size BEFORE uploading to Cloudinary
        const newFilesTotal = files.reduce((sum, f) => sum + (f.size || 0), 0);
        if (newFilesTotal > MAX_STORAGE_BYTES) {
            return res.status(400).json({ statusCode: 400, message: "Uploaded documents exceed 20 MB limit", });
        }

        // Upload files to Cloudinary (if any)
        let uploadedDocs = [];
        if (files.length) {
            for (const f of files) {
                if ((f?.size || 0) <= 0) continue;
                const folder = "DLD/caseDocs";
                let resource_type = 'raw';
                if (f.mimetype.startsWith("image/")) resource_type = 'image';
                else if (f.mimetype.startsWith("video/")) resource_type = 'video';

                const uploaded = await fileUploadOnCloudinary(f.path, folder, resource_type);

                uploadedDocs.push({
                    docUrl: uploaded?.secure_url || uploaded?.url,
                    publicId: uploaded?.public_id,
                    originalName: f.originalname || uploaded?.original_filename,
                    mimeType: f.mimetype || (uploaded?.resource_type && uploaded?.format ? `${uploaded.resource_type}/${uploaded.format}` : undefined),
                    fileSize: typeof uploaded?.bytes === "number" ? uploaded.bytes : f.size || 0,
                    isShowing: true,
                    backup: true,
                });
            }

            // Final guard: uploaded bytes should still be <= 100MB (defensive)
            const uploadedTotal = uploadedDocs.reduce((s, d) => s + (d.fileSize || 0), 0);
            if (uploadedTotal > MAX_STORAGE_BYTES) {
                return res.status(400).json({ statusCode: 400, message: "Uploaded documents exceed 20 MB limit", });
            }
        }

        // Construct case payload
        const payload = {
            caseTitle,
            caseHandler: user._id,
            caseDescription,
            caseType,
            client: client._id,
            caseDocs: uploadedDocs,
        };

        console.log(payload)
        if (handlingLawyerId) {
            payload.lawyer = handlingLawyerId;
        }

        // Create and save
        const newCase = new Case(payload);
        await newCase.save();

        // Populate minimal fields for response
        const saved = await Case.findById(newCase._id)
            .populate("client")
            .populate("lawyer")
            .select("-__v");

        return res.status(200).json({ statusCode: 200, message: "Case created successfully", data: saved, });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error while creating the case",
            error: error?.message || error,
        });
    }
};

// edit case
const editCase = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const caseId = req.params.caseId;
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ statusCode: 400, message: "Invalid caseId" });
        }

        const existingCase = await Case.findById(caseId).populate("client lawyer")
        if (!existingCase || !existingCase.caseHandler.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "Case not found" });
        }

        let { caseTitle, caseDescription, caseType, caseDocs, lawyerId } = req.body;

        // Parse caseDocs if coming as string from form-data
        if (typeof caseDocs === "string") {
            try {
                caseDocs = JSON.parse(caseDocs);
            } catch (err) {
                return res.status(400).json({ statusCode: 400, message: "Invalid caseDocs JSON" });
            }
        }

        // Determine lawyer handling
        let handlingLawyerId = null;
        if (user.role === "Law Firm") {
            if (!lawyerId || !mongoose.Types.ObjectId.isValid(lawyerId)) {
                return res.status(400).json({ statusCode: 400, message: "Valid lawyerId is required for Law Firm" });
            }
            const lawyer = await Lawyers.findById(lawyerId);
            if (!lawyer) {
                return res.status(400).json({ statusCode: 400, message: "Lawyer not found" });
            }
            handlingLawyerId = lawyer._id;
        }

        // Existing docs
        let updatedDocs = [...existingCase.caseDocs];

        // Mark removed docs as isShowing=false
        if (Array.isArray(caseDocs)) {
            const publicIdsFromClient = caseDocs
                .filter(d => d.publicId)
                .map(d => d.publicId);

            updatedDocs = updatedDocs.map(doc => {
                const plainDoc = doc.toObject ? doc.toObject() : doc;
                if (!publicIdsFromClient.includes(doc.publicId)) {
                    return { ...plainDoc, isShowing: false };
                }
                return { ...plainDoc, isShowing: true };
            });
        }

        // Handle new uploads
        const newFiles = Array.isArray(req.files?.docs) ? req.files.docs : [];
        if (newFiles.length) {
            const totalSize = updatedDocs.reduce((sum, d) => sum + (d.fileSize || 0), 0) +
                newFiles.reduce((sum, f) => sum + (f.size || 0), 0);

            if (totalSize > MAX_STORAGE_BYTES) {
                return res.status(400).json({ statusCode: 400, message: "Storage limit exceeded (20MB)" });
            }

            for (const file of newFiles) {
                const folder = "DLD/caseDocs";
                const resource_type = 'auto'
                const uploaded = await fileUploadOnCloudinary(file.path, folder, resource_type);
                updatedDocs.push({
                    docUrl: uploaded?.secure_url || uploaded?.url,
                    publicId: uploaded?.public_id,
                    originalName: file.originalname || uploaded?.original_filename,
                    mimeType: file.mimetype || (uploaded?.resource_type && uploaded?.format ? `${uploaded.resource_type}/${uploaded.format}` : undefined),
                    fileSize: uploaded?.bytes || file.size || 0,
                    backup: true,
                    isShowing: true,
                });

                // Optional: delete temp file
                try { fs.unlinkSync(file.path); } catch { }
            }
        }

        // Update case
        if (handlingLawyerId) {
            existingCase.lawyer = handlingLawyerId;
        }
        existingCase.caseTitle = caseTitle ?? existingCase.caseTitle;
        existingCase.caseDescription = caseDescription ?? existingCase.caseDescription;
        existingCase.caseType = caseType ?? existingCase.caseType;
        existingCase.caseDocs = updatedDocs;

        await existingCase.save();

        return res.status(200).json({ statusCode: 200, message: "Case updated successfully", data: existingCase });
    } catch (error) {
        console.error("editCase error:", error);
        return res.status(500).json({ statusCode: 500, message: "Error updating case", error: error.message });
    }
};

// del case
const delCase = async (req, res) => {
    try {
        // get id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const { caseId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ statusCode: 400, message: "Invalid caseId" });
        }

        const existingCase = await Case.findById(caseId);
        if (!existingCase || !existingCase.caseHandler.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "Case not found" });
        }

        if (Array.isArray(existingCase.caseDocs) && existingCase.caseDocs.length > 0) {
            for (const doc of existingCase.caseDocs) {
                if (doc.publicId) {
                    try {
                        const resourceType = getResourceType(doc.mimeType);
                        await removeFileFromCloudinary(doc.publicId, resourceType);
                    } catch (err) {
                        console.warn(`Failed to remove file ${doc.publicId}:`, err.message);
                    }
                }
            }
        }

        await Case.findByIdAndDelete(caseId);

        return res.status(200).json({
            statusCode: 200,
            message: "Case and all associated documents deleted successfully"
        });

    } catch (error) {
        console.error("deleteCase error:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "internal server Error to deleting case",
            error: error.message
        });
    }
};

// update case status
const updateStatus = async (req, res) => {
    try {
        // get id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get data from req.body
        const { caseId, newStatus, note } = req.body;

        if (!newStatus) {
            return res.status(400).json({ statusCode: 400, message: "New status is required" });
        }

        // find the case in db
        const existingCase = await Case.findById(caseId);
        if (!existingCase || !existingCase.caseHandler.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "Case not found" });
        }

        // If already same status, avoid duplicate log
        if (existingCase.status === newStatus) {
            return res.status(200).json({ statusCode: 200, message: "Status unchanged", case: existingCase });
        }

        // Update status
        existingCase.status = newStatus;
        existingCase.statusHistory.push({
            status: newStatus,
            // changedAt: new Date(),
            changedBy: user._id,
            note: note || "",
        });

        await existingCase.save();

        return res.status(200).json({ statusCode: 200, message: "Case status updated successfully", case: existingCase, });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to update status", error: error.message });
    }
};

// get all cases
const getCases = async (req, res) => {
    try {
        // get id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // Find all cases of user
        const cases = await Case.find({ caseHandler: user._id })
            .populate({
                path: "client",
            })
            .populate({
                path: "lawyer",
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ statusCode: 200, data: cases, });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "internal server Error fetching cases", error: error.message, });
    }
};

// get case through id
const getCase = async (req, res) => {
    try {
        // get id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const { id } = req.params

        // Find case
        const Cases = await Case.findById(id)
            .populate({
                path: "client",
            })
            .populate({
                path: "lawyer",
            })
            .sort({ createdAt: -1 });

        if (!Cases) {
            return res.status(400).json({ statusCode: 400, message: "case not found" });
        }

        return res.status(200).json({ statusCode: 200, data: Cases });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "internal server Error fetching cases", error: error.message, });
    }
};

// restore the docs of case
const restoreCaseFiles = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const { caseId, publicIds } = req.body;
        console.log(req.body)

        if (!mongoose.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ statusCode: 400, message: "Invalid caseId" });
        }

        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({ statusCode: 400, message: "publicIds must be a non-empty array" });
        }

        const existingCase = await Case.findById(caseId);
        if (!existingCase || !existingCase.caseHandler.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "Case not found" });
        }

        let updated = false;

        existingCase.caseDocs = existingCase.caseDocs.map(doc => {
            const plainDoc = doc.toObject ? doc.toObject() : doc;
            if (publicIds.includes(doc.publicId) && doc.isShowing === false) {
                updated = true;
                return { ...plainDoc, isShowing: true };
            }
            return plainDoc;
        });

        if (!updated) {
            return res.status(200).json({
                statusCode: 200,
                message: "No changes made (all selected docs are already visible)",
                case: existingCase
            });
        }

        await existingCase.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Selected case documents restored successfully",
            case: existingCase
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error while restoring case documents",
            error: error.message
        });
    }
};



export { createCase, editCase, delCase, updateStatus, getCases, getCase, restoreCaseFiles }

