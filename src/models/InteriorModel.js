const mongoose = require('mongoose');
const InteriorDataSchema = new mongoose.Schema({
  title: {
    type: String
  },
  clientName: {
    type: String
  },
  projectType: {
    type: String
  },
  siteAddress: {
    type: String
  },
  gstNo: {
    type: String
  },
  mahareraNo: {
    type: String
  },
  projectHead: {
    type: String
  },
  rccDesignerName: {
    type: String
  },
  Pan: {
    type: String
  },
  Aadhar: {
    type: String
  },
  Pin: {
    type: String
  },
  email: {
    type: String
  },
  Floor_Plan_1: {
    type: String
  },
  Floor_Plan_2: {
    type: String
  },
 Floor_Plan_3: {
    type: String
  },
  Floor_Plan_4: {
    type: String
  },
  Section_1: {
    type: String
  },
  Section_2: {
    type: String
  },
  Section_3: {
    type: String
  },
  Section_4: {
    type: String
  },
  All_Section: {
    type: String
  },
  All_Elevation: {
    type: String
  },
  Elevation_1: {
    type: String
  },
  Elevation_2: {
    type: String
  },
  Elevation_3: {
    type: String
  },
  Elevation_4: {
    type: String
  },
  All_Elevation: {
    type: String
  },
  ThreeD_Model_1: {
    type: String
  },
  ThreeD_Model_2: {
    type: String
  },
  ThreeD_Model_3: {
    type: String
  },
  ThreeD_Model_4: {
    type: String
  },
  Detail_Working_Layout_1: {
    type: String
  },
  Electrical_Layout_1: {
    type: String
  },
  Electrical_Layout_2: {
    type: String
  },
   Electrical_Layout_3: {
    type: String
  },
  Celling_Layout_1: {
    type: String
  },
  Celling_Layout_2: {
    type: String
  },
 Celling_Layout_3: {
       type: String
  },
  Celling_Layout_4: {
    type: String
  },
  PlumbingDetails_1: {
    type: String
  },
  PlumbingDetails_2: {
    type: String
  },
  Flooring_Details_1: {
    type: String
  },
 Flooring_Details_2: {
    type: String
  },
 Furniture_Details_1: {
    type: String
  },
Furniture_Details_2: {
    type: String
  },
Furniture_Details_3: {
    type: String
  },
Furniture_Details_4: {
    type: String
  },
Furniture_Details_5: {
    type: String
  },

Laminator_Venner_1: {
    type: String
  },
Laminator_Venner_2: {
    type: String
  },
Handles_Hardware_1: {
    type: String
  },
Handles_Hardware_2: {
    type: String
  },
Curtains_1: {
    type: String
  },
Curtains_2: {
    type: String
  },
Flooring_Details_1: {
    type: String
  },

Flooring_Details_2: {
    type: String
  },

Plumbing_Details_1: {
    type: String
  },
Plumbing_Details_2: {
    type: String
  },
Plumbing_Details_3: {
    type: String
  },

});
InteriorDataSchema.pre('save', async function (next) {
  const InteriorDataSchema = this;
  next();
})


module.exports = mongoose.model("InteriorDataSchema", InteriorDataSchema);