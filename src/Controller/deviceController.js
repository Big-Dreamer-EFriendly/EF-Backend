const Category = require('../Models/categoryModels');
const Device = require('../Models/deviceModels');




const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
  
};
const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch devices' });
  }
};
const getDevicesByCategoryId = async (req, res) => {
  const { id } = req.params;

  try {
    const devices = await Device.find({ id });

    if (devices.length === 0) {
      return res.status(404).json({ code:404,message: 'No devices found' });
    }

    res.json({code:200, message:"success",data:devices});
  } catch (error) {
    console.error(error);
    res.status(500).json({code:500, message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  getAllDevices,
  getDevicesByCategoryId

};



