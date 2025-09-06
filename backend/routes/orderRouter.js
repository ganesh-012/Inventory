const express = require('express')
const router = express.Router();

const {addOrder, getOrder, updateOrder, deleteOrder } = require('../controllers/orderController')

router.post('/add', addOrder)
router.get('/orders', getOrder)
router.patch('/update/:orderId', updateOrder)
router.delete('/delete/:orderId', deleteOrder)

module.exports = router