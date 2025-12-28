const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Meal = require('../models/Meal');

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    // Fetch real statistics from database
    const totalUsers = await User.countDocuments();
    const activeMeals = await Meal.countDocuments({ 
      date: { $gte: new Date(Date.now() - 24*60*60*1000) } 
    });
    
    // Calculate average calories from recent meals
    const avgCaloriesResult = await Meal.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
      { $group: { _id: null, avgCalories: { $avg: '$calories' } } }
    ]);
    const avgCalories = avgCaloriesResult.length > 0 ? Math.round(avgCaloriesResult[0].avgCalories) : 0;
    
    // Fetch all users for the table
    const users = await User.find()
      .select('firebaseUid email displayName createdAt status')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Transform users to match expected format
    const transformedUsers = users.map(user => ({
      id: user.firebaseUid,
      name: user.displayName || 'User',
      email: user.email,
      role: 'user',
      status: user.status || 'active',
      createdAt: user.createdAt
    }));
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeMeals,
        avgCalories,
      },
      users: transformedUsers,
      message: 'Admin stats fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users from database
    const users = await User.find()
      .select('firebaseUid email displayName createdAt healthProfile status')
      .sort({ createdAt: -1 });
    
    // Transform users to match expected format
    const transformedUsers = users.map(user => ({
      id: user.firebaseUid,
      name: user.displayName || 'User',
      email: user.email,
      role: 'user',
      status: user.status || 'active',
      createdAt: user.createdAt
    }));
    
    res.json({
      success: true,
      data: transformedUsers,
      message: 'Users fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // TODO: Update user role in database
    // const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    
    res.json({
      success: true,
      data: { role },
      message: 'User role updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban user
router.put('/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ban user in database
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      { status: 'banned' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unban user
router.put('/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Unban user in database
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      { status: 'active' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user from database
    const user = await User.findOneAndDelete({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
