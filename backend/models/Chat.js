const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userType: {
            type: String,
            enum: ['company', 'freelancer'],
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessage: {
        content: String,
        senderId: mongoose.Schema.Types.ObjectId,
        timestamp: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    unreadCount: {
        company: { type: Number, default: 0 },
        freelancer: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});


chatSchema.index({ jobId: 1, companyId: 1, freelancerId: 1 });
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);