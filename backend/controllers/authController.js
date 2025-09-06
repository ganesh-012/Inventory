const User = require('../models/user');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");
dotenv.config();

exports.registerUser = async(req,res) => {
    const { username, password, email, role} = req.body;
    try {
        const userExist = await User.findOne({username});
        if(userExist){
            return res.status(403).json({msg :"user already exist please login"})
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password,salt)
        console.log(hashedPassword)
        const newUser = await User.create({
            username,
            email,
            password : hashedPassword,
            role
        })

        const token = jwt.sign({userId : newUser._id, role : newUser.role}, process.env.JWT_SECRET);

        return res.status(201).json({msg : 'user register sucessfully',token : token, user : newUser})
    } catch (error) {
        return res.status(500).json({msg : `error in registering user: ${error.message}`})
    }
}

exports.loginUser = async (req,res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email : email});
    if (!user) {
      return res.status(400).json({ msg: "register first then login" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign({userId : user._id, role : user.role}, process.env.JWT_SECRET);
      return res.status(200).json({ msg: "login successfully", token: token, user : user });
    } else {
      return res.status(404).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in login user ${error.message}` });
  }
};

