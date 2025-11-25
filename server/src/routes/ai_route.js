const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai_controller');

router.post('/sentiment', aiController.analyzeSentiment);

module.exports = router;
