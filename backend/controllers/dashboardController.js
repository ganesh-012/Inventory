// controllers/dashboardController.js
const Product = require('../models/product');
const Order = require('../models/order');
const Supplier = require('../models/supplier');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { status: "issued" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.status(200).json({totalProducts, totalOrders, totalSuppliers, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
