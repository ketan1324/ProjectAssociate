const express = require('express');
const router = express.Router();
const {handleUpload,createModalData}= require('../controllers/ArchitectureController');

// Route to create a new entry with image upload
router.post('/upload', handleUpload, createModalData);

module.exports = router;
