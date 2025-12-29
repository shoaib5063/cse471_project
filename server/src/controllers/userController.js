const User = require('../models/User');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if valid firebase UID or fallback
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
            message: 'User profile fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Validate updates if necessary
        // Excluding critical fields from arbitrary update if needed, but for now allow all

        const user = await User.findOneAndUpdate(
            { firebaseUid: userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
            message: 'User profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const { firebaseUid, email, name } = req.body;

        if (!firebaseUid || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let user = await User.findOne({ firebaseUid });

        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        user = new User({
            firebaseUid,
            email,
            name,
            role: 'user', // Default role
            status: 'active'
        });

        await user.save();

        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    createUser
};
