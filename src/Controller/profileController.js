const userModels = require('../Models/userModels');

async function updateUser(req, res) {
  const information = req.body;
  const {user_id} = req;

  try {
    const user = await userModels.findByIdAndUpdate(user_id, information, { new: true });

    if (!user) {
      return res.status(404).json({code:404, message: 'User not found' });
    }

    res.status(200).json({code:200, message: 'User information updated successfully', user });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({code:500, message: 'Failed to update user information' });
  }
}
module.exports = {
  updateUser
};