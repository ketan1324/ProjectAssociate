const express = require('express');
const router = express.Router();
const { handleUpload, createInteriorData } = require('../controllers/InteriorController');

// Validation middleware for required fields

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum size is 10MB'
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'Unexpected field name in file upload'
        });
    }
    next(err);
};

// Post route with validation and error handling
router.post(
    '/uploadInterior',
   
    handleUpload,
    handleMulterError,
    createInteriorData
);

module.exports = router;