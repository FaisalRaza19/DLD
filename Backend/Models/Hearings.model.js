import mongoose from "mongoose";

const HEARING_PROGRESS = ["Scheduled", "Adjourned", "Completed", "Cancelled"];

const hearingSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        caseHandler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subHandler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lawyers",
        },
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 120,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        startsAt: {
            type: Date,
            required: true,
        },
        durationMinutes: {
            type: Number,
            min: 1,
            max: 1440,
            default: 60,
        },
        courtLocation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        progress: {
            type: String,
            enum: HEARING_PROGRESS,
            default: "Scheduled",
        },
        progressDetails : {
            type : String,
            minlength : 3,
            trim : true
        },
        notify: {
            type: Boolean,
            default: true,
        },
        reminderOffsetMinutes: {
            type: Number,
            min: 0,
            max: 10080,
            default: 60,
        },
    },
    {
        timestamps: true,
    }
);

hearingSchema.index({ caseId: 1, caseHandler: 1, startsAt: 1 });
export const Hearing = mongoose.model("Hearing", hearingSchema);
