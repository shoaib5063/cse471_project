const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'answered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    answeredAt: {
        type: Date
    }
});

module.exports = mongoose.model('Question', questionSchema);
