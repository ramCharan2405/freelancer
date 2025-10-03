const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middlewares/verifyToken');
const {
    sendMessage,
    getMessages,  // Changed from getChatMessages to getMessages
    markAsRead,   // Added this
    deleteMessage
} = require('../controllers/messageController');


console.log('📦 Imported functions:', {
    sendMessage: typeof sendMessage,
    getMessages: typeof getMessages,
    markAsRead: typeof markAsRead,
    deleteMessage: typeof deleteMessage
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed!'));
        }
    }
});


router.post('/send', verifyToken, upload.single('file'), sendMessage);


router.get('/:chatId', verifyToken, getMessages);


router.put('/:chatId/read', verifyToken, markAsRead);


router.delete('/:messageId', verifyToken, deleteMessage);








module.exports = router;