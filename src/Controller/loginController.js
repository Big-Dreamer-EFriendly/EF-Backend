const nodemailer = require('nodemailer');
const User = require('../Models/userModels');
const bcrypt = require('bcrypt');

require('dotenv').config();

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const currentTime = new Date();
    const lastEmailSent = user.updatedAt || null;
    const timeDifference = (currentTime - lastEmailSent) / (1000 * 60 * 60);
    if (lastEmailSent && timeDifference < 1) {
      return res.status(400).json({ error: 'You can only request a new password once per hour.' });
    }

    const newPassword = User.generateRandomPassword();
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.findByIdAndUpdate(user._id, { $set: { password: hashedNewPassword, lastEmailSent: currentTime } });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'New Password',
      text: `Your new password is: ${newPassword}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'A new password has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending the new password.' });
  }
};