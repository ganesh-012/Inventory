const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true
    },
    address: {
        type: String
    },
    productsSupplied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
},{timestamps: true});

module.exports = mongoose.model('Supplier', supplierSchema);

