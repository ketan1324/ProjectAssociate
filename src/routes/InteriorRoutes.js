const express = require('express');
const router = express.Router();
const { createModalData, getAllModalData } = require('../controllers/InteriorController');

// POST - Create new modal data
router.post('/create-interior', createModalData);

// GET - Fetch all modal data
router.get('/get-all-interior', getAllModalData);

module.exports = router;