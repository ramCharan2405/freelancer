const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');



const chatController = require('../controllers/chatController');


const {
    createChatOnAcceptance,
    getUserChats,
    getChatById,
    markChatAsRead
} = chatController;


router.post('/create', verifyToken, createChatOnAcceptance);


router.get('/', verifyToken, getUserChats);

router.get('/:chatId', verifyToken, getChatById);


router.put('/:chatId/read', verifyToken, markChatAsRead);



module.exports = router;