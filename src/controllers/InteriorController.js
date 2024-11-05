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
const updateInteriorData = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the existing document
      const existingData = await InteriorData.findById(id);
      if (!existingData) { 
        return res.status(404).json({ success: false, error: 'Record not found' });
      }
  
      // Prepare the update data, adding a new timestamp
      const updateData = { ...req.body, updatedAt: new Date() };
  
      // Process each file in the request
      const uploadPromises = Object.entries(req.files || {}).map(async ([fieldName, files]) => {
        const file = files[0];
  
        // Upload new file to S3
        const fileUrl = await uploadToS3(file, 'interior-uploads');
        updateData[fieldName] = fileUrl;
  
        // Delete the old file from S3 if it exists
        const oldUrl = existingData[fieldName];
        if (oldUrl) {
          const oldKey = oldUrl.split(`${BUCKET_NAME}/`)[1];
          if (oldKey) {
            await s3.deleteObject({ Bucket: BUCKET_NAME, Key: oldKey }).promise();
          }
        }
      });
  
      await Promise.all(uploadPromises);
  
      // Update the document in the database
      const updatedInteriorData = await InteriorData.findByIdAndUpdate(id, updateData, { new: true });
  
      res.status(200).json({
        success: true,
        message: 'Update successful',
        data: updatedInteriorData
      });
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ success: false, error: 'Update failed', details: error.message });
    }
  };
  

const deleteInteriorData = async (req, res) => {
    try {
        const { id } = req.params;
  
        // Find the existing document
        const existingData = await InteriorData.findById(id);
        if (!existingData) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }
  
        // Delete files from S3
        const deletePromises = Object.values(existingData.toObject()).map(async (fileUrl) => {
            if (typeof fileUrl === 'string' && fileUrl.includes(BUCKET_NAME)) {
                const fileKey = fileUrl.split(`${BUCKET_NAME}/`)[1];
                try {
                    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: fileKey }).promise();
                    console.log(`Deleted ${fileUrl} from S3.`);
                } catch (s3Error) {
                    console.error(`Failed to delete ${fileUrl}:`, s3Error.message);
                }
            }
        });
  
        await Promise.all(deletePromises);
  
        // Delete the document from the database
        await InteriorData.findByIdAndDelete(id);
  
        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, error: 'Delete failed', details: error.message });
    }
  };
  
const getAllInteriorData = async (req, res) => {
    try {
        // Fetch all interior data from the database
        const interiorData = await InteriorData.find();

        res.status(200).json({
            success: true,
            data: interiorData,
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve data',
            details: error.message,
        });
    }
};
const getInteriorDataById = async (req, res) => {
    try {
        // Get the ID from the request parameters
        const { id } = req.params;

        // Fetch the data by ID from the database
        const interiorData = await InteriorData.findById(id);

        if (!interiorData) {
            return res.status(404).json({
                success: false,
                error: 'Data not found',
            });
        }

        res.status(200).json({
            success: true,
            data: interiorData,
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve data by ID',
            details: error.message,
        });
    }
};


module.exports = {
    handleUpload: upload,
    createInteriorData,
    handleMulterError,
    updateInteriorData,
    deleteInteriorData,
    getAllInteriorData,
    getInteriorDataById
};