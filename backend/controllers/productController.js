const Product = require("../models/product");
const Supplier = require("../models/supplier");


exports.addProduct = async (req, res) => {
  try {
    const {name, sku, pricePerItem, quantity, description, category, supplierId } = req.body;
    const totalPrice = parseInt(quantity) * parseInt(pricePerItem);

    // Create the product
    const product = await Product.create({
      name,
      sku,
      quantity,
      totalPrice,
      description,
      category,
      supplierId,
    });

    // Update the supplier with this productId
    await Supplier.findByIdAndUpdate(
      supplierId,
      { $addToSet: { productsSupplied: product._id } },
      { new: true }
    );

    return res.status(201).json({ msg: "Product created successfully"});
  } catch (error) {
    return res.status(500).json({msg: `Error in creating product: ${error.message}`});
  }
};


exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    console.log("pages and limit are", page, limit);
    const skip = (page - 1) * limit;

    const products = await Product.find().skip(skip).limit(limit);
    const totaldocuments = await Product.countDocuments();
    const hasMore = page * limit < totaldocuments;

    if (!products) {
      return res.status(400).json({ msg: "unable to fetch products" });
    }
    return res
      .status(200)
      .json({
        msg: "product are fetched sucessfully",
        products: products,
        currentPage: page,
        hasMore: hasMore,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in fetching the data : ${error.message}` });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { newQuantity, newPrice } = req.body;
    console.log("new data is :", newQuantity, newPrice);
    const productId = req.params.productId;
    if (!productId)
      return res.status(400).json({ msg: "product id is missing" });

    const product = await Product.findOne({ _id: productId });
    if (!product) return res.status(400).json({ msg: "product not found" });
    product.quantity = parseInt(product.quantity) + parseInt(newQuantity) ?? product.quantity;
    product.totalPrice = parseInt(product.totalPrice) + (parseInt(newQuantity) * parseInt(newPrice)) ?? product.totalPrice;
    await product
      .save()
      .then(() => {
        return res.status(200).json({ msg: "product updated sucessfully" });
      })
      .catch((err) => {
        return res
          .status(400)
          .json({ msg: `unable to update products : ${err.message}` });
      });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in updating products : ${error.message}` });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("product id is", productId);
    if (!productId) {
      return res.status(400).json({ msg: "productId is missing" });
    }
    const response = await Product.deleteOne({ _id: productId });
    console.log(response);
    if (!response.deletedCount) {
      return res.status(400).json({ msg: "unable to delete the product" });
    }
    return res.status(200).json({ msg: "product is deleted sucessfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `error in deleting product: ${error.message}` });
  }
};
