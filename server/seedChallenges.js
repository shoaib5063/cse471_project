const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Challenge = require('./src/models/Challenge');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const now = new Date();
const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const challenges = [
  {
    title: '7-Day Clean Eating',
    description: 'Log 15 healthy meals (under 800 calories) this week.',
    type: 'healthy_meal_count',
    targetValue: 15,
    unit: 'meals',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'easy',
    xpReward: 100,
    icon: 'Salad'
  },
  {
    title: 'Calorie Control Master',
    description: 'Log at least 20 meals to track your intake consistently.',
    type: 'calorie_limit',
    targetValue: 20,
    unit: 'meals logged',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'medium',
    xpReward: 250,
    icon: 'Flame'
  },
  {
    title: 'Protein Power Week',
    description: 'Reach 5 high-protein meals this week.',
    type: 'protein_goal',
    targetValue: 5,
    unit: 'meals',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'easy',
    xpReward: 150,
    icon: 'Dumbbell'
  },
  {
    title: 'Hydration Hero',
    description: 'Log hydration and reach 35 glasses this week.',
    type: 'hydration_goal',
    targetValue: 35,
    unit: 'glasses',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'easy',
    xpReward: 120,
    icon: 'Droplets'
  },
  {
    title: 'Vegetable Streak',
    description: 'Log a vegetable-rich meal every day for 7 days.',
    type: 'streak',
    targetValue: 7,
    unit: 'days',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'medium',
    xpReward: 300,
    icon: 'Salad'
  },
  {
    title: 'Balanced Plate',
    description: 'Log 10 balanced meals (carbs+protein+fat) this week.',
    type: 'healthy_meal_count',
    targetValue: 10,
    unit: 'meals',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'medium',
    xpReward: 220,
    icon: 'Trophy'
  },
  {
    title: 'Low Sugar Sprint',
    description: 'Keep logged dessert/snack sugar low; track 8 logs.',
    type: 'custom',
    targetValue: 8,
    unit: 'logs',
    durationDays: 7,
    startDate: now,
    endDate: inDays(7),
    difficulty: 'hard',
    xpReward: 400,
    icon: 'Flame'
  }
];

const seed = async () => {
  try {
    const ops = challenges.map((ch) => ({
      updateOne: {
        filter: { title: ch.title },
        update: { $set: ch },
        upsert: true,
      }
    }));
    const result = await Challenge.bulkWrite(ops);
    console.log('✅ Challenges upserted', {
      upserts: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    process.exit(1);
  }
};

seed();
