const express = require('express');
const router = express.Router();
const {
    submitQuestion,
    getAllQuestions,
    replyToQuestion
} = require('../controllers/questionController');

// Submit question (User)
router.post('/', submitQuestion);

// Get all questions (Admin) - In a real app, add admin middleware here
router.get('/', getAllQuestions);

// Reply to question (Admin) - In a real app, add admin middleware here
router.post('/:questionId/reply', replyToQuestion);

module.exports = router;
