const dotenv = require('dotenv');
dotenv.config(); // Load env vars from .env in CWD

const mongoose = require('mongoose');
const MealReminder = require('../models/MealReminder');
const { checkAndSendReminders } = require('../services/reminderScheduler');


const testScheduler = async () => {
    try {
        if (!process.env.MONGODB_URI) require('dotenv').config();

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const targetUserIds = ['user-mubashshiramuba888', 'user-mahtabkhan9911'];
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        console.log(`Current time is: ${currentTime}`);

        for (const userId of targetUserIds) {
            // Update breakfast reminder to match current time
            const result = await MealReminder.findOneAndUpdate(
                { userId: userId, mealType: 'breakfast' },
                { reminderTime: currentTime, isActive: true },
                { new: true }
            );

            if (result) {
                console.log(`Updated breakfast reminder for ${userId} to ${currentTime}`);
            } else {
                console.error(`❌ Could not find breakfast reminder for ${userId}`);
            }
        }

        console.log('Running scheduler check...');
        await checkAndSendReminders();
        console.log('Check complete.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing scheduler:', error);
        process.exit(1);
    }
};

testScheduler();
