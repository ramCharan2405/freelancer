const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Freelancer",
            required: true,
        },
        coverLetter: {
            type: String,
            maxlength: 1000,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "withdrawn"],
            default: "pending",
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        response: {
            type: String,
            maxlength: 500,
            default: "",
        },
        responseDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);


applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });


applicationSchema.index({ freelancer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
