const nodemailer = require('nodemailer');
const User = require('../Models/userModels');
require('dotenv').config();

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const newPassword = User.generateRandomPassword();

    await User.findByIdAndUpdate(user._id, { $set: { password: newPassword } });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',  
      port: 465,
      secure: true,
      auth: {
        user: "ptho6452@gmail.com",
        pass: "dvks igif gvqy uojn"
      },
      
    });

    const mailOptions = {
      from: "ptho6452@gmail.com",
      to: "tho.phan24@student.passerellesnumeriques.org",
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
