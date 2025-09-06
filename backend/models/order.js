const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product'
    },
    quantity : {
        type : Number,
        required : true
    },
    issuedTo : {
        type : String,
        requried : true
    },
    purpose : {
        type : String,
        required : true
    },
    issuedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    totalPrice : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['issued','returned'],
        default : "issued"
    }
},{timestamps : true})

const Order = mongoose.model('Order',orderSchema)
module.exports = Order