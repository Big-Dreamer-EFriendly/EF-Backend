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
  }
  
module.exports = new AuthController();