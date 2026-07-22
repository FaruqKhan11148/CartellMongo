const Product = require('../schema/productSchema');

// Get all products
const getAllProducts = async () => {
  return await Product.find({ image_url: { $ne: null } }).sort({
    createdAt: -1,
  });
};

// Create a new product
const createProduct = async (product) => {
  const newProduct = new Product(product);
  return await newProduct.save();
};

// Update product (price/stock/description)
const updateProduct = async (id, product) => {
  return await Product.findByIdAndUpdate(
    id,
    {
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
    },
    { new: true },
  );
};

// Update stock
const updateStock = async (productId, quantity) => {
  return await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: quantity } },
    { new: true },
  );
};

// Get single product by ID
const getProductById = async (id) => {
  return await Product.findById(id);
};

// Search products
const searchProducts = async (searchText) => {
  return await Product.find({
    $or: [
      { name: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
    ],
  }).select('name description price image_url');
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  getProductById,
  updateStock,
  searchProducts,
};
