const adminService = require('../services/adminService');
const productService = require('../services/productService');

// ================= DASHBOARD STATS API =================
const getAdminStats = (req, res) => {
  adminService.fetchAdminStats((err, stats) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(stats);
  });
};

// ================= USERS API =================
const getAllUsers = (req, res) => {
  adminService.fetchAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
};

// Render users with order count page
const getAllUsersForAdmin = (req, res) => {
  adminService.fetchAllUsersWithOrders((err, users) => {
    if (err) return res.status(500).send(err.message);
    res.render('admin/allUsers', { users });
  });
};

// ================= ORDERS API =================
const getAllOrders = (req, res) => {
  adminService.fetchAllOrders((err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
};

// ================= LOW STOCK =================
const getLowStockProducts = (req, res) => {
  adminService.fetchLowStockProducts((err, products) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(products);
  });
};

// ================= SUBCATEGORIES =================
const getSubcategories = (req, res) => {
  const categoryId = req.params.categoryId;

  adminService.getSubcategories(categoryId, (err, subcategories) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(subcategories);
  });
};

// ================= DASHBOARD PAGE =================
const getDashboard = (req, res) => {
  adminService.fetchAdminStats((err, stats) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.render('admin/dashboard', { stats });
  });
};

// ================= ORDERS PAGE =================
const getAllOrdersPage = async (req, res) => {
  try {
    const orders = await adminService.fetchAllOrders();
    orders.forEach((order) => (order.activities = [])); // optional
    res.render('admin/adminOrders', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
};

// ================= ADMIN PRODUCTS PAGE =================
const getAllAdminProductsPage = async (req, res) => {
  try {
    const products = await productService.getAllProducts(); // now this exists
    res.render('admin/adminProducts', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
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

    return res.redirect('/products');
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await productService.updateProduct(id, req.body);

    return res.redirect('/api/admin/products-admin');
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Failed to update product', error: err });
  }
};

const restockProduct = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity <= 0)
    return res.status(400).json({ message: 'Quantity must be > 0' });

  productService.restockProduct(id, quantity, (err) => {
    if (err)
      return res.status(500).json({ message: 'Failed to restock', error: err });
    res.redirect('/api/admin/products-admin');
  });
};

// ================= EDIT PRODUCT PAGE =================
const renderEditProductPage = (req, res) => {
  const productId = req.params.id;
  adminService.getProductById(productId, (err, product) => {
    if (err) return res.status(500).send('Server error');
    if (!product) return res.status(404).send('Product not found');
    res.render('admin/adminEditProduct', { product });
  });
};

// ================= ADD PRODUCT PAGE =================
const renderAddProductPage = async (req, res) => {
  res.render('admin/addProduct');
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllOrders,
  getLowStockProducts,
  getSubcategories,
  getDashboard,
  getAllOrdersPage,
  getAllAdminProductsPage,
  addProduct,
  updateProduct,
  restockProduct,
  renderEditProductPage,
  renderAddProductPage,
  getAllUsersForAdmin,
};
