const productService = require('../services/productService');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await productService.fetchAllProducts();
    res.render('pages/products', { products });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        message: 'name, price, and stock are required',
      });
    }

    const image_url = req.file ? req.file.path : null;

    const product = await productService.createProduct({
      name,
      price,
      description,
      stock,
      image_url,
    });

    return res.redirect('/api/admin/products-admin');
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await productService.editProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err });
  }
};

// Get product by id
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProduct(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Update stock
const restockProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be > 0' });
    }

    const updated = await productService.restockProduct(id, quantity);

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restock', error: err });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const searchText = req.query.q;

    if (!searchText) {
      return res.redirect('/');
    }

    const products = await productService.searchProducts(searchText);

    res.render('pages/searchResults', {
      products: products || [],
      searchText,
    });
  } catch (err) {
    console.log(err);
    res.render('pages/searchResults', {
      products: [],
      searchText: req.query.q,
    });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  getProduct,
  restockProduct,
  searchProducts,
};
