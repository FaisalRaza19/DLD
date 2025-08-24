import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
import fs from "fs"
dotenv.config({
    path: "./.env"
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export const fileUploadOnCloudinary = async (fileData, folder, resource_type) => {
    try {
        if (!fileData) return null;
        const uploadFile = await cloudinary.uploader.upload(fileData, {
            folder: folder,
            resource_type: resource_type,
            type: 'upload'
        });
        fs.unlinkSync(fileData);
        return uploadFile;
    } catch (error) {
        fs.unlinkSync(fileData);
        console.error("Error uploading file to Cloudinary:", error);
    }
};

export const removeFileFromCloudinary = async (public_id, resource_type) => {
    try {
        if (!public_id) return null;
        const deleteFile = await cloudinary.uploader.destroy(public_id, {
            resource_type: resource_type,
        });
        return deleteFile;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};