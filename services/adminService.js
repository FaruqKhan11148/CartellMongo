const User = require('../schema/userSchema');
const Order = require('../schema/orderSchema');
const Product = require('../schema/productSchema'); // <--- use schema, not model wrapper

// Fetch dashboard stats
const fetchAdminStats = async (callback) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
    });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: 'paid' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'success' } },
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

// Fetch all users
const fetchAllUsers = async (callback) => {
  try {
    const users = await User.find({ role: 'user' }).select(
      '_id name email role createdAt',
    );
    callback(null, users);
  } catch (err) {
    callback(err);
  }
};

// Fetch all orders
const fetchAllOrders = async () => {
  return await Order.find()
    .populate('user', '_id name email') // populate user
    .populate('items.product', '_id name price image_url') // populate product
    .sort({ createdAt: -1 })
    .lean();
};

// Fetch low stock products
const fetchLowStockProducts = async (callback) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } }).sort({
      stock: 1,
    });
    callback(null, products);
  } catch (err) {
    callback(err);
  }
};

// Get single product by ID
const getProductById = async (productId, callback) => {
  try {
    const product = await Product.findById(productId);
    callback(null, product);
  } catch (err) {
    callback(err);
  }
};

// Fetch all users with order count
const fetchAllUsersWithOrders = async (callback) => {
  try {
    const usersWithOrders = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $addFields: { totalOrders: { $size: '$orders' } },
      },
      { $project: { name: 1, email: 1, totalOrders: 1 } },
    ]);
    callback(null, usersWithOrders);
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllOrders,
  fetchLowStockProducts,
  getProductById,
  fetchAllUsersWithOrders,
};
