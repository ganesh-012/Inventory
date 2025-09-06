const jwt = require('jsonwebtoken');
const User = require('../models/user')
const dotenv = require('dotenv')
dotenv.config();

const JWT_SECRET= process.env.JWT_SECRET

const authMiddleware = async(req,res,next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return res.status(401).json({msg : 'No token provided'})
        }
        const decoded = jwt.verify(token,JWT_SECRET)
        console.log(decoded)
        req.user = await User.findOne({_id : decoded.userId})
        next();
    } catch (error) {
        return res.status(401).json({msg : 'Invalid token please login first'})
    }
}

module.exports = authMiddleware