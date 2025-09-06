
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const roleMiddleware = async(req,res,next) => {
    const token = req.headers.authorization.split(' ')[1]
    if(!token) return res.status(400).json({msg : 'token is missing'})
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('role in middleware', decoded.role)
        if (decoded.role === 'Admin') {
            return next(); 
        } else {
            return res.status(403).json({ msg: 'Permission denied only Admin allowed' });
        }
    } catch (error) {
        return res.status(500).json({msg: `error in role middleware : ${error.message}`})
    }
}

module.exports = roleMiddleware