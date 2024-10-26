// src/models/modalData.js
const mongoose = require('mongoose');

const modalDataSchema = new mongoose.Schema({
  title: { type: String },
  clientName: { type: String },
  projectType: { type: String },
  siteAddress: { type: String },
  gstNo: { type: String },
  mahareraNo: { type: String },
  projectHead: { type: String },
  rccDesignerName: { type: String },
  Pan: { type: String },
  Aadhar: { type: String },
  Pin: { type: String },
  email: { type: String },
  Presentation_Drawing_1: { type: String },
  Presentation_Drawing_2: { type: String },
  Presentation_Drawing_3: { type: String },
  File_Model_3D_1: { type: String },
  File_Model_3D_2: { type: String },
  File_Model_3D_3: { type: String },
  Submission_Drawing: { type: String },
  All_Floor_Plan: { type: String },
  All_Section: { type: String },
  All_Elevation: { type: String },
  toilet: { type: String },
  All_Electric_Drawing: { type: String },
  tile_Layout: { type: String },
  All_Grills_And_Railing: { type: String },
  Column_Footing: { type: String },
  Pleanth_Beam: { type: String },
  Stair_Case_Drawing: { type: String },
  Slab_1: { type: String },
  Slab_2: { type: String },
  Slab_3: { type: String },
  Slab_4: { type: String },
  Slab_5: { type: String },
  BuildingApprovalDate: { type: String },
  buildingCompletionDate: { type: String },
  Property_Card: { type: String },
  Property_Map: { type: String },
  Completion_Drawing: { type: String },
  SanctionDrawing: { type: String },
  Revise_Sanction: { type: String },
  Completion_Letter: { type: String },
});

modalDataSchema.pre('save', async function (next) {
  // Pre-save hook logic can be added here
  next();
});

module.exports = mongoose.model("ModalData", modalDataSchema);
