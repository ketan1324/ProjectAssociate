const AWS = require('aws-sdk');
const multer = require('multer');
const InteriorData = require('../models/InteriorModel');
const { v4: uuidv4 } = require('uuid');

// AWS Configuration
const BUCKET_NAME = 'interiorbucket1';
const AWS_REGION = 'ap-south-1';

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
});

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    params: { Bucket: BUCKET_NAME }
});

// Multer configuration
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Allow only specific file types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/vnd.dwg',  // AutoCAD files
        'application/octet-stream'  // Generic binary files
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10 MB limit
        files: 25 // Maximum number of files
    }
}).fields([
    { name: 'Floor_Plan_1', maxCount: 1 },
    { name: 'Floor_Plan_2', maxCount: 1 },
    { name: 'Floor_Plan_3', maxCount: 1 },
    { name: 'Floor_Plan_4', maxCount: 1 },
    { name: 'Section_1', maxCount: 1 },
    { name: 'Section_2', maxCount: 1 },
    { name: 'Section_3', maxCount: 1 },
    { name: 'Section_4', maxCount: 1 },
    { name: 'All_Elevation', maxCount: 1 },
    { name: 'Elevation_1', maxCount: 1 },
    { name: 'Elevation_2', maxCount: 1 },
    { name: 'Elevation_3', maxCount: 1 },
    { name: 'Elevation_4', maxCount: 1 },
    { name: 'ThreeD_Model_1', maxCount: 1 },
    { name: 'ThreeD_Model_2', maxCount: 1 },
    { name: 'ThreeD_Model_3', maxCount: 1 },
    { name: 'ThreeD_Model_4', maxCount: 1 },
    { name: 'Detail_Working_Layout_1', maxCount: 1 },
    { name: 'Electrical_Layout_1', maxCount: 1 },
    { name: 'Electrical_Layout_2', maxCount: 1 },
    { name: 'Electrical_Layout_3', maxCount: 1 },
    { name: 'Celling_Layout_1', maxCount: 1 },
    { name: 'Celling_Layout_2', maxCount: 1 }
]);

const uploadToS3 = async (file, folder) => {
    if (!file) return null;

    // Generate a unique filename with UUID
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}-${Date.now()}.${fileExtension}`;
    
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: 'inline'
    };

    try {
        await s3.putObject(params).promise();
        return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

const createInteriorData = async (req, res) => {
    try {
        // Validate request
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded. Please upload at least one file.'
            });
        }

        if (!req.body.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Prepare interior data
        const interiorData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Upload files to S3
        const uploadPromises = Object.entries(req.files).map(async ([fieldName, files]) => {
            try {
                const file = files[0];
                const fileUrl = await uploadToS3(file, 'interior-uploads');
                interiorData[fieldName] = fileUrl;
                return { fieldName, status: 'success', url: fileUrl };
            } catch (error) {
                return { fieldName, status: 'error', error: error.message };
            }
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(result => result.status === 'error');

        if (failedUploads.length > 0) {
            return res.status(500).json({
                success: false,
                error: 'Some files failed to upload',
                details: failedUploads
            });
        }

        // Save to database
        const newInteriorData = await InteriorData.create(interiorData);

        res.status(201).json({
            success: true,
            message: 'Upload successful',
            data: newInteriorData,
            uploadResults: uploadResults
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            details: error.message
        });
    }
};

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size limit exceeded. Maximum size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files uploaded.'
            });
        }
    }
    next(err);
};

module.exports = {
    handleUpload: upload,
    createInteriorData,
    handleMulterError
};