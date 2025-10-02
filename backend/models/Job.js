const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        location: {
            type: String,
            required: true,
            default: "Remote",
        },
        salary: {
            type: String,
            required: true,
            default: "Not specified",
        },
        budget: {
            type: String,
            required: false,
        },
        payPerHour: {
            type: Number,
            required: false,
        },
        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "freelance"],
            default: "freelance",
        },
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        skillsRequired: [
            {
                type: String,
                trim: true,
            },
        ],
        requirements: {
            type: String,
            default: "",
        },
        responsibilities: {
            type: String,
            default: "",
        },
        experience: {
            type: String,
            enum: ["entry", "mid", "senior"],
            default: "entry",
        },
        experienceLevel: {
            type: String,
            required: false,
        },
        deadline: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "closed"],
            default: "active",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for better performance
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ skills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
