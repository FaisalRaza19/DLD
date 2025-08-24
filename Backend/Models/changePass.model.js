import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true,
    },
    used: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

export const PassReset = mongoose.model("PasswordResetToken", passwordResetTokenSchema);