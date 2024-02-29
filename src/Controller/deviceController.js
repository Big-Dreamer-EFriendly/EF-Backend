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
module.exports = {
  getAllCategories,
  getAllDevices

};



