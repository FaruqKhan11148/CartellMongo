const productModel = require('../models/productModel'); // your wrapper

// Fetch all products
const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

// Create product
const createProduct = async (product) => {
  return await productModel.createProduct(product);
};

// Get single product by id
const getProductById = async (id) => {
  return await productModel.getProductById(id);
};

// Update product
const updateProduct = async (id, data) => {
  return await productModel.updateProduct(id, data);
};

// Update stock
const updateStock = async (productId, quantity) => {
  return await productModel.updateStock(productId, quantity);
};

// Search
const searchProducts = async (text) => {
  return await productModel.searchProducts(text);
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateStock,
  searchProducts,
};
