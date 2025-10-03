const express = require('express');
const router = express.Router();
const { chatWithAI, getSuggestedQuestions } = require('../controllers/chatbotController');
const verifyToken = require('../middlewares/verifyToken');


router.use(verifyToken);


router.post('/chat', chatWithAI);


router.get('/suggestions', getSuggestedQuestions);

module.exports = router;