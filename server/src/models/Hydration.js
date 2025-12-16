const mongoose = require('mongoose');

const hydrationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number, // in ml
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Index for getting daily hydration quickly
hydrationSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Hydration', hydrationSchema);
