const User = require('../schema/userSchema');
const Product = require('../schema/productSchema');
const Order = require('../schema/orderSchema');
const Category = require('../schema/categorySchema');
const Subcategory = require('../schema/subcategorySchema');

// ============================
// DASHBOARD STATS
// ============================
const getDashboardStats = async (callback) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ order_status: 'paid' });
    const shippedOrders = await Order.countDocuments({ order_status: 'shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ order_status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ order_status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ order_status: 'cancelled' });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { payment_status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    callback(null, {
      totalUsers,
      totalProducts,
      lowStockProducts,
      totalOrders,
      paidOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    });
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET ALL USERS
// ============================
const getAllUsers = async (callback) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    callback(null, users);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET ALL ORDERS
// ============================
const getAllOrders = async (callback) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    callback(null, orders);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET LOW STOCK PRODUCTS
// ============================
const getLowStockProducts = async (callback) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .lean();
    callback(null, products);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET SUBCATEGORIES BY CATEGORY
// ============================
const getSubcategoriesByCategory = async (categoryId, callback) => {
  try {
    const subcategories = await Subcategory.find({ category: categoryId }).lean();
    callback(null, subcategories);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET ALL CATEGORIES
// ============================
const getAllCategories = async (callback) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    callback(null, categories);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET PRODUCT BY ID
// ============================
const getProductById = async (productId, callback) => {
  try {
    const product = await Product.findById(productId).lean();
    callback(null, product);
  } catch (err) {
    callback(err);
  }
};

// ============================
// GET USERS WITH ORDER COUNT
// ============================
const getAllUsersWithOrderCount = async (callback) => {
  try {
    const usersWithOrders = await User.aggregate([
      {
        $lookup: {
          from: 'orders',       // collection name in Mongo
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalOrders: { $size: '$orders' },
        },
      },
    ]);
    callback(null, usersWithOrders);
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getLowStockProducts,
  getSubcategoriesByCategory,
  getAllCategories,
  getProductById,
  getAllUsersWithOrderCount,
};
