const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middlewares/roleMiddleware');

const { addProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');

router.post('/add',roleMiddleware, addProduct)
router.get('/products', getProducts)
router.patch('/update/:productId', roleMiddleware, updateProduct)
router.delete('/delete/:productId', roleMiddleware, deleteProduct)


module.exports = router
