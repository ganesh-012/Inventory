const Supplier = require('../models/supplier');

exports.createSupplier = async (req, res) => {
    try {
        const { name, contactNumber, email, address } = req.body;
        const newSupplier = {
            name,
            contactNumber,
            email,
            address
        }
        await Supplier.create(newSupplier).then(() => {
            return res.status(201).json({msg :'supplier created successfully'})
        }).catch((err) => {
            return res.status(404).json({msg : `unable to create supplier : ${err.message}`})
        })
    } catch (error) {
        res.status(500).json({msg : `error in creating a suppier : ${error.message}`});
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const skip = (page - 1)* limit;

        const suppliers = await Supplier.find().populate('productsSupplied').skip(skip).limit(limit);
        console.log(suppliers);

        const totalDoc = await Supplier.countDocuments();
        const hasMore = (page * limit) < totalDoc

        if(!suppliers){
            return res.status(404).json({msg : 'supplier not found'})
        }
        return res.status(200).json({msg : 'suppliers are fetched successfully', suppliers : suppliers, hasMore, currentPage : page})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.supplierId, req.body, { new : true });
        if (!supplier) {
            return res.status(404).json({ msg : 'Supplier not found' });
        }

        res.status(200).json({msg : 'sucessfully updated supplier'});
    } catch (error) {
        res.status(500).json({msg : `error in updating supplier : ${error.message}`});
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.supplierId);
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        res.status(200).json({ msg : 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({msg : `error in deleting the supplier : ${error.message}`});
    }
};
