import mongoose from "mongoose";

// Client Subschema 
const clientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: [/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"],
        },
        address: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export const Clients = mongoose.model("Clients", clientSchema)