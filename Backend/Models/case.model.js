import mongoose from "mongoose";

const MAX_STORAGE_BYTES = 100 * 1024 * 1024;

// Document Subschema
const docSchema = new mongoose.Schema(
    {
        docUrl: {
            type: String,
            trim: true
        },
        publicId: {
            type: String,
            trim: true
        },
        originalName: {
            type: String,
            trim: true
        },
        mimeType: {
            type: String,
            trim: true
        },
        fileSize: {
            type: Number,
            default: 0,
            min: 0
        },
        isShowing: {
            type: Boolean,
            default: true
        },
        backup: {
            type: Boolean,
            default: true
        },
    },
    { _id: false, timestamps: true }
);

// status his schema
const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["Open", "In Progress", "On Hold", "Closed"],
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        note: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        }
    },
    { _id: false }
);

// ---- Case Schema ----
const caseSchema = new mongoose.Schema(
    {
        caseTitle: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },
        caseHandler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        caseDescription: {
            type: String,
            trim: true,
            minlength: 20
        },
        caseType: {
            type: String,
            required: true,
            enum: ["Civil", "Criminal", "Family", "Corporate", "Tax", "Property", "Constitutional", "Other",]
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Clients"
        },
        lawyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lawyers"
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "On Hold", "Closed",],
            default: "Open",
            required: true
        },
        statusHistory: [statusHistorySchema],
        caseDocs: {
            type: [docSchema],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ---- Virtuals ----
// Link hearings via virtual populate
caseSchema.virtual("hearings", {
    ref: "Hearing",
    localField: "_id",
    foreignField: "caseId",
});

// ---- Middleware ----
function calcTotalBytes(docs = []) {
    return docs.reduce((sum, d) => sum + (d?.fileSize || 0), 0);
}

// Storage limit check on save
caseSchema.pre("save", function (next) {
    const totalSize = calcTotalBytes(this.caseDocs);
    if (totalSize > MAX_STORAGE_BYTES) {
        return next(
            new Error('Storage limit exceeded: Max 100 MB allowed per case')
        );
    }

    // Initialize status history for new case
    if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
        this.statusHistory = [
            { status: this.status, changedAt: new Date(), changedBy: this.caseHandler },
        ];
    }
    next();
});

// Storage limit check on findOneAndUpdate
caseSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() || {};
    const current = await this.model.findOne(this.getQuery()).select("caseDocs").lean();
    let nextDocs = current?.caseDocs || [];

    if (update.caseDocs) nextDocs = update.caseDocs;
    if (update.$set?.caseDocs) nextDocs = update.$set.caseDocs;
    if (update.$push?.caseDocs) {
        const pushVal = update.$push.caseDocs;
        if (Array.isArray(pushVal?.$each)) nextDocs = nextDocs.concat(pushVal.$each);
        else nextDocs = nextDocs.concat(pushVal);
    }

    const totalSize = calcTotalBytes(nextDocs);
    if (totalSize > MAX_STORAGE_BYTES) {
        return next(
            new Error('Storage limit exceeded: Max 100 MB allowed per case')
        );
    }
    next();
});


// ---- Indexes ----
caseSchema.index({ caseHandler: 1, status: 1, updatedAt: -1 });
caseSchema.index({ caseType: 1, createdAt: -1 });

export const Case = mongoose.model("Case", caseSchema);
