import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["hearing_reminder", "hearing_today", "hearing_follow_up", "hearing_created", "hearing_updated", "hearing_deleted"],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        meta: {
            type: Object,
            default: {}
        },
        isRead: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);
