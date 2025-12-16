const express = require('express');
const router = express.Router();
const { logHydration, getDailyHydration } = require('../controllers/hydrationController');

router.post('/', logHydration);
router.get('/:userId', getDailyHydration);

module.exports = router;
