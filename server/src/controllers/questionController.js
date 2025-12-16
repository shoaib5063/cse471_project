const Question = require('../models/Question');
const { sendQuestionReplyEmail } = require('../services/emailService');

// Submit a new question
const submitQuestion = async (req, res) => {
    try {
        const { userId, userEmail, question } = req.body;

        if (!userId || !userEmail || !question) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newQuestion = new Question({
            userId,
            userEmail,
            question
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question submitted successfully', question: newQuestion });
    } catch (error) {
        console.error('Error submitting question:', error);
        res.status(500).json({ error: 'Failed to submit question' });
    }
};

// Get all questions (Admin)
const getAllQuestions = async (req, res) => {
    try {
        const { status } = req.query; // optional filter: 'pending' or 'answered'
        const query = status ? { status } : {};

        const questions = await Question.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

// Reply to a question (Admin)
const replyToQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({ error: 'Answer is required' });
        }

        const question = await Question.findByIdAndUpdate(
            questionId,
            {
                answer,
                status: 'answered',
                answeredAt: new Date()
            },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Send email notification
        try {
            await sendQuestionReplyEmail(question.userEmail, question.question, answer);
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request, just log it. The answer is saved.
        }

        res.json({ message: 'Reply sent successfully', question });
    } catch (error) {
        console.error('Error replying to question:', error);
        res.status(500).json({ error: 'Failed to reply to question' });
    }
};

module.exports = {
    submitQuestion,
    getAllQuestions,
    replyToQuestion
};
