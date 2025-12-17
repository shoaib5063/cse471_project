const express = require('express');
const router = express.Router();
const { logHydration, getDailyHydration, updateHydration, deleteHydration } = require('../controllers/hydrationController');

router.post('/', logHydration);
router.get('/:userId', getDailyHydration);
router.put('/:id', updateHydration);
router.delete('/:id', deleteHydration);

module.exports = router;
