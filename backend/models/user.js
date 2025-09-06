const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        index : 1
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['Admin', 'Staff'],
        required : true
    },
},{timestamps : true })

const User = mongoose.model('User',userSchema)
module.exports = User