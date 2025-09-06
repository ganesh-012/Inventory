const express = require('express')
const router = express.Router()
const roleMiddleware = require('../middlewares/roleMiddleware')

const { createSupplier, getSuppliers, updateSupplier, deleteSupplier } = require('../controllers/supplierController')

router.post('/create', roleMiddleware, createSupplier )
router.get('/suppliers', getSuppliers)
router.patch('/update/:supplierId', roleMiddleware, updateSupplier)
router.delete('/delete/:supplierId',roleMiddleware, deleteSupplier)

module.exports = router