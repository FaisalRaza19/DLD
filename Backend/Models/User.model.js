import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        fullName: {
            type: String,
            required: true,
            minlength: 3,
            trim: true,
        },
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: String,
            default: "Lawyer/Attorney",
            enum: ["Lawyer/Attorney", "Law Firm"],
        },
        avatar: {
            avatarUrl: String,
            public_Id: String,
        },
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            match: [/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"],
        },
        totalLawyer: {
            type: Number,
            min: 1,
        },
        address: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure indexes
userSchema.index({ email: 1, userName: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
