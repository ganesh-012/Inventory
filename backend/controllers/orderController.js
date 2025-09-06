const Order = require("../models/order");
const Product = require("../models/product");
const Supplier = require('../models/supplier')

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function checkAndNotify(product) {
  if (product.quantity <= product.threshold) {
    if (!product.lastNotificationSent || new Date() - new Date(product.lastNotificationSent) > 24 * 60 * 60 * 1000) {
      
      const supplier = await Supplier.findById(product.supplierId);
      await sendLowStockEmail(supplier.email,product.name, product.quantity);

      product.lastNotificationSent = new Date();
      await product.save();
    }
  }
}

async function sendLowStockEmail(supplierMail, productName, stock){
  console.log(supplierMail, process.env.EMAIL_USER, process.env.PASS_USER,'in email sender code')
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASS_USER
    }
  });
  
  let mailOptions = {
    from: 'pandrameesuganesh@gmail.com',
    to: `${supplierMail}`,
    subject: `Low Stock Alert: ${productName}`,
    text: `Stock for ${productName} is low. Current stock: ${stock}. Please restock soon.`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

exports.addOrder = async (req, res) => {
  try {
    const { productId, quantity, issuedTo, purpose, issuedBy, pricePerItem } = req.body;

    if(quantity){
      const product = await Product.findById(productId);
      if(!product) return res.status(404).json({ msg: "Product not found" });
      if(product.quantity < quantity){
        return res.status(400).json({msg : `Low stock. Only ${product.quantity} pieces available.`})
      }
      product.quantity -= quantity,
      await product.save()
      await checkAndNotify(product)
    }

    const newOrder = {
      productId,
      quantity,
      issuedTo,
      purpose,
      issuedBy,
      totalPrice : parseInt(pricePerItem) * parseInt(quantity)
    };

    await Order.create(newOrder);
    return res.status(200).json({ msg: "Order created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `Error in adding order: ${error.message}` });
  }
};


exports.getOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    console.log("page and limit in orders", page, limit);

    const skip = (page - 1) * limit;
    const orders = await Order.find().skip(skip).limit(limit).populate("productId", "name").populate("issuedBy", "username")
    console.log('orders in backend', orders)
    const totalDoc = await Order.countDocuments();

    const hasMore = page * limit < totalDoc;

    if (!orders) {
      return res.status(400).json({ msg: "unable to fetch the orders"});
    }
    return res
      .status(200)
      .json({
        msg: "orders fetched successfully",
        orders: orders,
        hasMore,
        currentPage: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in fetching orders : ${error.message}` });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(status,'in the backend')
    if (!orderId) {
      return res.status(400).json({ msg : "Invalid Order ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg : "Order not found" });
    }

    if(order.status !== status){
      const product = await Product.findById(order.productId)
      if(status === 'issued'){
        if(product.quantity < order.quantity){
          return res.status(400).json({msg : `low stock only ${product.quantity} pieces are available`})
        }
        product.quantity -= order.quantity
      }else{
        product.quantity += order.quantity
      }

      await product.save();
      await checkAndNotify(product)
      order.status = status;
      await order.save();
    }
    res.status(200).json({msg : 'updated status sucessfully'});
  } catch (err) {
    res.status(500).json({msg : `error in updating order : ${err.message}`});
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log("order id is", orderId);
    if (!orderId) {
      return res.status(400).json({ msg: "orderId is missing" });
    }
    const response = await Order.deleteOne({ _id: orderId });
    console.log(response);
    if (!response.deletedCount) {
      return res.status(400).json({ msg: "unable to delete the order" });
    }
    return res.status(200).json({ msg: "order is deleted sucessfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in deleting order: ${error.message}` });
  }
};
