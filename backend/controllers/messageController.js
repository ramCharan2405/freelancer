const Message = require('../models/Message');
const Chat = require('../models/Chat');
const cloudinary = require('../config/cloudinary');


const sendMessage = async (req, res) => {
    try {
        const { chatId, content, messageType = 'text' } = req.body;
        const senderId = req.user.userId;
        let fileUrl = null;
        let fileName = null;

        console.log('📤 Sending message:', {
            senderId,
            chatId,
            content: content?.substring(0, 30),
            messageType
        });


        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const isParticipant = chat.participants.some(
            p => p.userId.toString() === senderId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            });
        }


        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'chat-files',
                    resource_type: 'auto'
                });
                fileUrl = result.secure_url;
                fileName = req.file.originalname;
            } catch (uploadError) {

                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload file'
                });
            }
        }


        const message = new Message({
            chatId,
            senderId,
            content: content || '',
            messageType: fileUrl ? (req.file?.mimetype.startsWith('image/') ? 'image' : 'file') : 'text',
            fileUrl,
            fileName,
            isRead: false
        });

        await message.save();


        chat.lastMessage = {
            content: content || fileName || 'File',
            senderId,
            timestamp: new Date()
        };
        chat.updatedAt = new Date();


        const senderParticipant = chat.participants.find(p => p.userId.toString() === senderId);
        const receiverParticipant = chat.participants.find(p => p.userId.toString() !== senderId);

        if (receiverParticipant) {
            if (!chat.unreadCount) {
                chat.unreadCount = { company: 0, freelancer: 0 };
            }
            chat.unreadCount[receiverParticipant.userType] = (chat.unreadCount[receiverParticipant.userType] || 0) + 1;
        }

        await chat.save();


        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'fullName email profilePicture');

        console.log('✅ Message created:', {
            messageId: message._id,
            senderId: message.senderId,
            content: message.content?.substring(0, 30)
        });


        const io = req.app.get('io');
        if (io) {
            const socketMessage = {
                ...populatedMessage.toObject(),
                chatId
            };


            io.to(chatId).emit('message:receive', socketMessage);


            io.to(chatId).emit('chat:updated', {
                chatId,
                lastMessage: chat.lastMessage,
                unreadCount: chat.unreadCount
            });
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: populatedMessage
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const getMessages = async (req, res) => {
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

        const isParticipant = chat.participants.some(
            p => p.userId.toString() === userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }


        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'fullName email profilePicture');


        if (messages.length > 0) {
            console.log('🔍 Sample message structure:', {
                senderId: messages[0].senderId?._id,
                senderIdType: typeof messages[0].senderId,
                content: messages[0].content?.substring(0, 30)
            });
        }


        await Message.updateMany(
            {
                chatId,
                senderId: { $ne: userId },
                isRead: false
            },
            { isRead: true }
        );

        res.json({
            success: true,
            messages
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;



        const result = await Message.updateMany(
            {
                chatId,
                senderId: { $ne: userId },
                isRead: false
            },
            { isRead: true }
        );



        res.json({
            success: true,
            message: 'Messages marked as read',
            updatedCount: result.modifiedCount
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }


        if (message.senderId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.deleteOne();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

console.log('📦 Message Controller Functions:', {
    sendMessage: typeof sendMessage,
    getMessages: typeof getMessages,
    markAsRead: typeof markAsRead,
    deleteMessage: typeof deleteMessage
});

module.exports = {
    sendMessage,
    getMessages,
    markAsRead,
    deleteMessage
};