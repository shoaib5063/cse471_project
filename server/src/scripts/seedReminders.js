const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MealReminder = require('../models/MealReminder');

dotenv.config({ path: '../.env' }); // Adjust path if necessary, running from src/scripts

const seedReminders = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            // Fallback or error if env not loaded correctly from relative path
            require('dotenv').config();
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Users to seed
        const usersToSeed = [
            { userId: 'user-mubashshiramuba888', email: 'mubashshiramuba888@gmail.com' },
            { userId: 'user-mahtabkhan9911', email: 'mahtabkhan9911@gmail.com' }
        ];

        console.log(`Seeding reminders for ${usersToSeed.length} users...`);

        const defaultReminders = [
            { mealType: 'breakfast', reminderTime: '08:00', mealName: 'Healthy Breakfast' },
            { mealType: 'lunch', reminderTime: '13:00', mealName: 'Power Lunch' },
            { mealType: 'snack', reminderTime: '16:00', mealName: 'Afternoon Snack' },
            { mealType: 'dinner', reminderTime: '20:00', mealName: 'Light Dinner' }
        ];

        for (const user of usersToSeed) {
            console.log(`Processing ${user.email}...`);
            for (const def of defaultReminders) {
                const exists = await MealReminder.findOne({ userId: user.userId, mealType: def.mealType });
                if (!exists) {
                    await MealReminder.create({
                        userId: user.userId,
                        email: user.email,
                        mealType: def.mealType,
                        reminderTime: def.reminderTime,
                        mealName: def.mealName,
                        isActive: true
                    });
                    console.log(`  + Added ${def.mealType} reminder`);
                } else {
                    console.log(`  = Reminder ${def.mealType} already exists`);
                }
            }
        }

        console.log('✅ Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reminders:', error);
        process.exit(1);
    }
};

seedReminders();

