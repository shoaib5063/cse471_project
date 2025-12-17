const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

// Routes
router.get('/active', challengeController.getActiveChallenges);
router.get('/my', challengeController.getUserChallenges);
router.post('/:id/join', challengeController.joinChallenge);
router.post('/', challengeController.createChallenge); // Admin

module.exports = router;
