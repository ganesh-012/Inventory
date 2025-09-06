const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        index : 1
    },
    sku : {
        type : String,
        required : true
    },
    description : {
        type : String,
    },
    category : {
        type : String,
    },
    quantity : {
        type : Number,
        required : true
    },
    totalPrice : {
        type : Number
    },
    supplierId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Supplier'
    },
    threshold : {
        type : Number,
        default : 5
    },
    lastNotificationSent : {
        type: Date,
        default: Date.now
    }
},{timestamps : true})
const Product = mongoose.model('Product',productSchema);
module.exports = Product