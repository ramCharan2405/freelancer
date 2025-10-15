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
            default: "",
        },
        proposedRate: {
            type: Number,
        },
        estimatedDuration: {
            type: String,
        },

        // ✅ NEW: Multi-stage recruitment fields
        status: {
            type: String,
            enum: [
                "pending", // Initial application
                "auto-rejected", // Auto-rejected by skill mismatch
                "under-review", // Skills 50-75% match, needs manual review
                "qualified", // Skills >75% match
                "in-review", // Company is reviewing
                "assignment-sent", // Assignment sent to freelancer
                "assignment-submitted", // Freelancer submitted assignment
                "interview-scheduled", // Interview scheduled
                "interview-completed", // Interview done, awaiting decision
                "accepted", // Final acceptance
                "rejected", // Final rejection
            ],
            default: "pending",
        },

        // ✅ NEW: Skill matching score
        skillMatchScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        matchedSkills: [
            {
                type: String,
            },
        ],
        missingSkills: [
            {
                type: String,
            },
        ],
        autoRejectionReason: {
            type: String,
        },

        // ✅ NEW: Assignment phase
        assignment: {
            title: String,
            description: String,
            deadline: Date,
            submissionUrl: String, // GitHub, Live Demo, Drive link
            submissionNotes: String,
            submittedAt: Date,
            isReviewed: {
                type: Boolean,
                default: false,
            },
            reviewNotes: String,
            reviewScore: Number, // 0-100
            reviewedAt: Date,
        },

        // ✅ NEW: Interview phase
        interview: {
            scheduledDate: Date,
            scheduledTime: String,
            meetingLink: String, // Google Meet, Zoom, etc.
            duration: String, // "30 minutes", "1 hour"
            notes: String,
            isCompleted: {
                type: Boolean,
                default: false,
            },
            completedAt: Date,
            feedbackNotes: String,
            rating: Number, // 0-5
        },

        // ✅ NEW: Timeline tracking
        timeline: [
            {
                stage: {
                    type: String,
                    enum: [
                        "application_submitted",
                        "auto_screened",
                        "manual_review_started",
                        "assignment_sent",
                        "assignment_submitted",
                        "assignment_reviewed",
                        "interview_scheduled",
                        "interview_completed",
                        "final_decision",
                    ],
                },
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                notes: String,
            },
        ],

        response: {
            type: String,
        },
        responseDate: {
            type: Date,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// ✅ NEW: Index for faster queries
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ job: 1, freelancer: 1 });
applicationSchema.index({ skillMatchScore: -1 });

module.exports = mongoose.model("Application", applicationSchema);
