const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const ModalData = require('../models/modalData');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define array of fields for file uploads
const fileFields = [
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
  { name: 'Completion_Letter', maxCount: 1 },
];

// Function to handle uploading images and saving text data
const uploadImages = async (req, res) => {
  try {
    const files = req.files;
    const body = req.body;

    // Create a new instance of the model and add text fields
    const modalData = new ModalData({
      title: body.title,
      clientName: body.clientName,
      projectType: body.projectType,
      siteAddress: body.siteAddress,
      gstNo: body.gstNo,
      mahareraNo: body.mahareraNo,
      projectHead: body.projectHead,
      rccDesignerName: body.rccDesignerName,
      Pan: body.Pan,
      Aadhar: body.Aadhar,
      Pin: body.Pin,
      email: body.email,
    });

    // Upload files to Cloudinary and save URLs in the model
    for (const key in files) {
      const file = files[key][0];
      const result = await cloudinary.uploader.upload(file.path, { folder: 'uploads' });
      modalData[key] = result.secure_url;
    }

    // Save all data to the database
    await modalData.save();
    res.status(201).json({ success: true, data: modalData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, uploadImages, fileFields };
