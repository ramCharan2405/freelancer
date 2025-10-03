const Chat = require('../models/Chat');
const Message = require('../models/Message');


const getUserChats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const chats = await Chat.find({
            'participants.userId': userId,
            isActive: true
        })
            .populate({
                path: 'jobId',
                select: 'title description salary location type'
            })
            .populate({
                path: 'companyId',
                select: 'companyName organization logo profilePicture industry location website description',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            })
            .populate({
                path: 'freelancerId',
                select: 'fullName bio profilePicture skills experience hourlyRate location rating portfolio',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            })
            .populate({
                path: 'participants.userId',
                select: 'fullName email'
            })
            .sort({ updatedAt: -1 });



        res.json({
            success: true,
            chats
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;

        const chat = await Chat.findById(chatId)
            .populate({
                path: 'jobId',
                select: 'title description salary location type'
            })
            .populate({
                path: 'companyId',
                select: 'companyName organization logo profilePicture industry location website description',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            })
            .populate({
                path: 'freelancerId',
                select: 'fullName bio profilePicture skills experience hourlyRate location rating portfolio',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            })
            .populate({
                path: 'participants.userId',
                select: 'fullName email'
            });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }


        const isParticipant = chat.participants.some(
            p => p.userId._id.toString() === userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this chat'
            });
        }

        res.json({
            success: true,
            chat
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const createChatOnAcceptance = async (req, res) => {
    try {
        const { jobId, companyId, freelancerId, applicationId } = req.body;


        let chat = await Chat.findOne({
            jobId,
            companyId,
            freelancerId
        });

        if (chat) {
            return res.json({
                success: true,
                message: 'Chat already exists',
                chat
            });
        }


        chat = new Chat({
            jobId,
            companyId,
            freelancerId,
            applicationId,
            participants: [
                {
                    userId: req.user.userId,
                    userType: req.user.role
                }
            ],
            isActive: true
        });

        await chat.save();


        const populatedChat = await Chat.findById(chat._id)
            .populate({
                path: 'jobId',
                select: 'title description salary location type'
            })
            .populate({
                path: 'companyId',
                select: 'companyName organization logo profilePicture industry location website description',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            })
            .populate({
                path: 'freelancerId',
                select: 'fullName bio profilePicture skills experience hourlyRate location rating portfolio',
                populate: {
                    path: 'user',
                    select: 'fullName email'
                }
            });



        res.status(201).json({
            success: true,
            message: 'Chat created successfully',
            chat: populatedChat
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const markChatAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }


        const participant = chat.participants.find(
            p => p.userId.toString() === userId
        );

        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }


        if (!chat.unreadCount) {
            chat.unreadCount = {};
        }
        chat.unreadCount[participant.userType] = 0;

        await chat.save();

        res.json({
            success: true,
            message: 'Chat marked as read'
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createChatOnAcceptance,
    getUserChats,
    getChatById,
    markChatAsRead
};