const express = require('express');
const router = express.Router();

// Firebase auth is handled on the client side
// These routes are for additional auth-related operations

router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Check against Admins collection in database
    // For now, using hardcoded admin credentials for demonstration
    const adminCredentials = [
      { email: 'admin@healthapp.com', password: 'admin123', name: 'Super Admin' },
      { email: 'manager@healthapp.com', password: 'manager123', name: 'Manager' }
    ];
    
    const admin = adminCredentials.find(
      admin => admin.email === email && admin.password === password
    );
    
    if (admin) {
      res.json({
        success: true,
        admin: {
          email: admin.email,
          name: admin.name,
          role: 'admin'
        },
        message: 'Admin login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    // TODO: Verify Firebase token with Firebase Admin SDK
    // const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({
      success: true,
      message: 'Token verified'
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
