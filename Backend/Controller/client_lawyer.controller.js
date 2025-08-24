import { User } from "../Models/User.model.js";
import { Clients } from "../Models/Client.model.js";
import { Lawyers } from "../Models/Lawyer.model.js";
import { verifyUserData } from "../utility/userInputVerify.js"

// create client
const createClient = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get client data 
        const { fullName, email, phoneNumber, address } = req.body;
        if (!fullName || !email || !phoneNumber || !address) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // verify data
        const verifyInput = verifyUserData(req.body);
        if (!verifyInput.isValid) {
            return res.status(400).json({ statusCode: 400, message: verifyInput.errors });
        }

        const client = new Clients({
            user: user._id,
            fullName,
            email,
            phoneNumber,
            address
        })
        await client.save()

        return res.status(200).json({ statusCode: 200, message: "client create successfully", data: client })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to create client", error: error.message });
    }
}

// edit client
const editClient = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get client data 
        const { clientId, fullName, email, phoneNumber, address } = req.body;
        if (!clientId || !fullName || !email || !phoneNumber || !address) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // verify data
        const verifyInput = verifyUserData(req.body);
        if (!verifyInput.isValid) {
            return res.status(400).json({ statusCode: 400, message: verifyInput.errors });
        }

        const client = await Clients.findById(clientId);
        if (!client || !client.user.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "client did not exist" });
        }

        client.fullName = fullName;
        client.email = email;
        client.phoneNumber = phoneNumber;
        client.address = address;
        await client.save()

        return res.status(200).json({ statusCode: 200, message: "client edit successfully", data: client })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to edit client", error: error.message });
    }
}

// del client
const delClient = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get client data 
        const { clientId } = req.body;
        if (!clientId) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // find and del client
        const client = await Clients.findByIdAndDelete(clientId)
        if (!client.user.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "you are not elligible to del the client info" });
        }

        return res.status(200).json({ statusCode: 200, message: "client del successfully" })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to del client", error: error.message });
    }
}

// get client
const getClient = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get all clients of user
        const client = await Clients.find({ user: user._id })

        return res.status(200).json({ statusCode: 200, message: "client get successfully", data: client })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to get client", error: error.message });
    }
}

// add lawyer off firm
const createLawyer = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user || user.role !== "Law Firm") {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get lawyer data 
        const { fullName, email, phoneNumber, specialization, address,experience} = req.body;
        if (!fullName || !email || !phoneNumber || !specialization || !address || !experience) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // verify data
        const verifyInput = verifyUserData(req.body);
        if (!verifyInput.isValid) {
            return res.status(400).json({ statusCode: 400, message: verifyInput.errors });
        }

        const lawyer = new Lawyers({
            user: user._id,
            fullName,
            email,
            phoneNumber,
            specialization,
            address,
            experience,
        })
        await lawyer.save()

        return res.status(200).json({ statusCode: 200, message: "lawyer create successfully", data: lawyer })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to create lawyer", error: error.message });
    }
}

// edit lawyer of firm
const editLawyer = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user || user.role !== "Law Firm") {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get lawyer data 
        const { lawyerId, fullName, email, phoneNumber, specialization, address,experience} = req.body;
        if (!lawyerId || !fullName || !email || !phoneNumber || !address || !specialization || !experience) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // verify data
        const verifyInput = verifyUserData(req.body);
        if (!verifyInput.isValid) {
            return res.status(400).json({ statusCode: 400, message: verifyInput.errors });
        }

        const lawyer = await Lawyers.findById(lawyerId);
        if (!lawyer || !lawyer.user.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "lawyer did not exist" });
        }

        lawyer.fullName = fullName;
        lawyer.email = email;
        lawyer.phoneNumber = phoneNumber;
        lawyer.specialization = specialization;
        lawyer.address = address;
        lawyer.experience = experience
        await lawyer.save()

        return res.status(200).json({ statusCode: 200, message: "lawyer edit successfully", data: lawyer })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to edit lawyer", error: error.message });
    }
}

// del lawyer of firm
const delLawyer = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user || user.role !== "Law Firm") {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get lawyer data 
        const { lawyerId } = req.body;
        if (!lawyerId) {
            return res.status(400).json({ statusCode: 400, message: "all fields required" });
        }

        // find and del lawyer
        const lawyer = await Lawyers.findByIdAndDelete(lawyerId)
        if (!lawyer.user.equals(user._id)) {
            return res.status(400).json({ statusCode: 400, message: "you are not elligible to del the lawyer info" });
        }

        return res.status(200).json({ statusCode: 200, message: "lawyer del successfully" })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to del lawyer", error: error.message });
    }
}

// get lawyer
const getLawyer = async (req, res) => {
    try {
        const userId = req.user?._id
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        // Ensure user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user || user.role !== "Law Firm") {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        // get all lawyer
        const lawyer = await Lawyers.find({ user: user._id })

        return res.status(200).json({ statusCode: 200, message: "lawyer get successfully", data: lawyer })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error to get lawyer", error: error.message });
    }
}

export { createClient, editClient, delClient, getClient, createLawyer, editLawyer, delLawyer, getLawyer }