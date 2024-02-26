const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModels = require('../Models/userModels');

require('dotenv').config()



function generateToken(user) {
  return jwt.sign({ id: user._id}, process.env.SECRET_KEY_JWT, { expiresIn: '1h' });
}

function generateRefreshToken(user) {
  return jwt.sign( { id: user._id}, process.env.REFRESH_KEY_JWT, { expiresIn: '4h' });
}
class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password,address,member } = req.body;
      
      const existingUser = await userModels.findOne({ email });
      if (existingUser) {
          return res.status(400).json({
            code: 400,
            message: "Email already taken",
              }
)    }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModels.create({ name: name,email,address,member,password : hashedPassword });
        return res.status(201).json({
          code: 201,
          message: "success",
          data: newUser
      });
    } catch (error) {
      console.error(error);
      console.log(req.body);
          }return res.status(500).json({
          code: 500,
          message: "Internal server error",    
      });
    }


  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModels.findOne({email});
      
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user)
        user.refreshtoken = refreshToken
        await user.save()
        res.cookie("token", token, {maxAge:3600000})
        res.cookie("refreshToken", refreshToken, { httpOnly: true , secure: true, maxAge: 14400000 })
          return res.status(200).json({
            code: 200,
            message: "Login successful",
            data: token
});
      } else {
          return res.status(401).json({
            code: 401,
            message: "Invalid credentials",
        });
      }
    } catch (error) {
      console.error(error);
        return res.status(500).json({
          code: 500,
          message: "Internal server error",
      });
    }
  }

  async logout(req, res) {
    const {refreshToken} = req.body;
    const user = await userModels.findOne({where:{refreshToken}});
    if (!user){
        return res.status(404).json({
          code: 404,
          message: "User not found",   
      });
    }
    res.clearCookie("token")
    res.clearCookie("refreshToken")
    user.refreshtoken = null
    await user.save()
      return res.status(200).json({
        code: 200,
        message: "Logout successful",
        data: user
    });
  }

  async refreshToken(req, res) {
      const refreshToken=req.cookies["refreshToken"]
      console.log(refreshToken)
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_JWT);
      const userId=decoded.id
      const user =await userModels.findOne({_id:userId,refreshtoken:refreshToken})
      console.log(user)
      if (!user) {
            return res.status(401).json({
              code: 401,
              message: "Invalid refreshToken ",
              data: user
          });
      }
      const newToken = generateToken(user);
      const tokenMaxAge = 3600000; // 1 hour
      res.cookie("token", newToken, { maxAge: tokenMaxAge });
        return res.status(200).json({
          code: 200,
          message: "refreshToken successful",
          data: newToken
      });
      } catch (error) {
          return res.status(401).json({
            code: 401,
            message: "Invalid or expired refresh token",
          
        });
      }
      async forgotPassword (req, res) {
        const { email } = req.body;
      
        try {
          const user = await userModels.findOne({ email });
      
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
    async changePassword(req, res)  {
        const { currentPassword, newPassword } = req.body;
        const { user_id } = req;
        try {
          const user = await userModels.findById(user_id);
      
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
      
          res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred while changing the password' });
        }
      };
  
  }
  
module.exports = new AuthController();