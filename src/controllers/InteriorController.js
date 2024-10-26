const ModalData = require('../models/InteriorModel');

exports.createModalData = async (req, res) => {
  try {
    const newModalData = new ModalData(req.body);
    const savedModalData = await newModalData.save();
   
    res.status(201).json({
      success: true,
      message: 'Modal data created successfully',
      data: savedModalData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating modal data',
      error: error.message
    });
  }
};

exports.getAllModalData = async (req, res) => {
  try {
    const modalData = await ModalData.find();
    res.status(200).json({
      success: true,
      data: modalData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modal data',
      error: error.message
    });
  }
};