const Hydration = require('../models/Hydration');

// Log hydration
const logHydration = async (req, res) => {
    try {
        const { userId, amount, date } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: 'Missing userId or amount' });
        }

        const hydration = new Hydration({
            userId,
            amount,
            date: date || new Date()
        });

        await hydration.save();
        res.status(201).json({ message: 'Hydration logged', hydration });
    } catch (error) {
        console.error('Error logging hydration:', error);
        res.status(500).json({ error: 'Failed to log hydration' });
    }
};

// Get daily hydration
const getDailyHydration = async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.query;

        const targetDate = date ? new Date(date) : new Date();
        // Start of day
        targetDate.setHours(0, 0, 0, 0);

        // End of day
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const logs = await Hydration.find({
            userId,
            date: {
                $gte: targetDate,
                $lt: nextDay
            }
        });

        const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);

        res.json({ totalAmount, logs });
    } catch (error) {
        console.error('Error getting hydration:', error);
        res.status(500).json({ error: 'Failed to get hydration' });
    }
};

module.exports = {
    logHydration,
    getDailyHydration
};
