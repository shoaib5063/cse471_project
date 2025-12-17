const express = require('express');
const router = express.Router();
const controller = require('../controllers/groceryController');

router.post('/generate', controller.generate);

module.exports = router;
