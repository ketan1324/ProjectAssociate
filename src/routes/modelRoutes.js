const express = require('express');
const router = express.Router();
const { uploadFiles, createModalData } = require('../controllers/ImageController');

router.post('/upload', uploadFiles, createModalData); // Make sure uploadFiles is used here

module.exports = router;
