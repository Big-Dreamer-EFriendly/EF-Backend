const userModels = require('../Models/userModels');
const bcrypt = require('bcrypt');

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
async function getUser(req, res) {
  const {user_id} = req;

  try {
    const user = await userModels.findById({_id:user_id});

    if (!user) {
      return res.status(404).json({code:404, message: 'User not found' });
    }

    res.status(200).json({code:200, message: 'Get information successfully', user });
  } catch (error) {
    console.error('Internal:', error);
    res.status(500).json({code:500, message: 'Internal' });
  }
}
async function  changePassword(req, res)  {
  const { currentPassword, newPassword } = req.body;
  const { user_id } = req;
  try {
    const user = await userModels.findById(user_id);
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatched) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ code:200,message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({code:500, message: 'An error occurred while changing the password' });
  }
};

module.exports = {
  updateUser,
  getUser,
  changePassword
};