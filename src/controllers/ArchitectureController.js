const AWS = require('aws-sdk');
const multer = require('multer');
const ModalData = require('../models/ArchiTectureModel');
const { v4: uuidv4 } = require('uuid');

const BUCKET_NAME = 'awsbucke2'; // Your bucket name

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    params: { Bucket: BUCKET_NAME }
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: 'Presentation_Drawing_1', maxCount: 1 },
    { name: 'Presentation_Drawing_2', maxCount: 1 },
    { name: 'Presentation_Drawing_3', maxCount: 1 },
    { name: 'File_Model_3D_1', maxCount: 1 },
    { name: 'File_Model_3D_2', maxCount: 1 },
    { name: 'File_Model_3D_3', maxCount: 1 },
    { name: 'Submission_Drawing', maxCount: 1 },
    { name: 'All_Floor_Plan', maxCount: 1 },
    { name: 'All_Section', maxCount: 1 },
    { name: 'All_Elevation', maxCount: 1 },
    { name: 'toilet', maxCount: 1 },
    { name: 'All_Electric_Drawing', maxCount: 1 },
    { name: 'tile_Layout', maxCount: 1 },
    { name: 'All_Grills_And_Railing', maxCount: 1 },
    { name: 'Column_Footing', maxCount: 1 },
    { name: 'Pleanth_Beam', maxCount: 1 },
    { name: 'Stair_Case_Drawing', maxCount: 1 },
    { name: 'Slab_1', maxCount: 1 },
    { name: 'Slab_2', maxCount: 1 },
    { name: 'Slab_3', maxCount: 1 },
    { name: 'Slab_4', maxCount: 1 },
    { name: 'Slab_5', maxCount: 1 },
    { name: 'Property_Card', maxCount: 1 },
    { name: 'Property_Map', maxCount: 1 },
    { name: 'Completion_Drawing', maxCount: 1 },
    { name: 'SanctionDrawing', maxCount: 1 },
    { name: 'Revise_Sanction', maxCount: 1 },
    { name: 'Completion_Letter', maxCount: 1 }
]);

const uploadToS3 = async (file, folder) => {
    if (!file) return null;

    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const uploadResult = await s3.putObject(params).promise();
        const fileUrl = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;
        return fileUrl;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

const createModalData = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const modalData = {
            ...req.body,
            createdAt: new Date()
        };

        const uploadPromises = [];
        for (const fieldName in req.files) {
            const file = req.files[fieldName][0];
            uploadPromises.push(
                uploadToS3(file, 'uploads')
                    .then(fileUrl => {
                        modalData[fieldName] = fileUrl;
                    })
                    .catch(error => {
                        throw new Error(`Failed to upload ${fieldName}: ${error.message}`);
                    })
            );
        }

        await Promise.all(uploadPromises);

        if (!modalData.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newModalData = await ModalData.create(modalData);

        res.status(201).json({
            success: true,
            message: 'Upload successful',
            data: newModalData
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

module.exports = {
    handleUpload: upload,
    createModalData
};