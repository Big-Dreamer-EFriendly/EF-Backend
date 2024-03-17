
const Tip = require('../Models/tipModels')
async function getTipsByUserId(req, res) {
  try {
    const { id } = req; 
    const tips = await Tip.find({ userId:id });
    res.status(200).json({ code: 200, data:tips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
}
module.exports = {
  getTipsByUserId
};