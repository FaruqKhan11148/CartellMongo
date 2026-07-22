const Order = require('../schema/orderSchema');
const Product = require('../schema/productSchema');
const Cart = require('../schema/cartSchema'); // for getCartWithProducts
const mongoose = require('mongoose');

// ========== GET CART WITH PRODUCTS ==========
const getCartWithProducts = async (userId) => {
  const cartItems = await Cart.find({ user: userId }).populate(
    'product',
    'price stock',
  );
  return cartItems.map((item) => ({
    product_id: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));
};

// ========== CREATE ORDER ==========
const createOrder = async (
  userId,
  total,
  shippingAddress,
  coupon = null,
  discount = 0,
) => {
  const order = new Order({
    user: userId,
    items: [],
    total,
    discount,
    coupon,
    shippingAddress,
    status: 'created',
    statusLogs: [{ status: 'created', date: new Date() }],
  });
  await order.save();
  return order;
};

// ========== ADD ORDER ITEM ==========
const addOrderItem = async (orderId, productId, quantity, price) => {
  const order = await Order.findById(orderId);
  if (!order) return null;

  order.items.push({ product: productId, quantity, price });
  await order.save();
  return order;
};

// ========== CLEAR CART ==========
const clearCart = async (userId) => {
  await Cart.deleteMany({ user: userId });
};

// ========== GET ORDER WITH ITEMS ==========
const getOrderWithItems = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate(
    'items.product',
  );
  return order;
};

// ========== GET ORDERS BY USER ==========
const getOrdersByUser = async (userId) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('items.product');
};

// ========== GET ORDERS BY USER PAGINATED ==========
const getOrdersByUserPaginated = async (userId, limit, offset) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate('items.product');
};

// ========== GET ORDER ==========
const getOrder = async (userId, orderId) => {
  return await Order.findOne({ _id: orderId, user: userId }).populate(
    'items.product',
  );
};

// ========== MARK ORDER PAID ==========
const markOrderPaid = async (
  orderId,
  userId,
  method,
  transactionId,
  isAdmin = false,
) => {
  const query = { _id: orderId, paymentStatus: 'pending' };
  if (!isAdmin) query.user = userId;

  const order = await Order.findOne(query);
  if (!order) return null;

  order.paymentStatus = 'success';
  order.paymentMethod = method;
  order.transactionId = transactionId;
  order.status = 'paid';
  order.statusLogs.push({ status: 'paid', date: new Date() });
  await order.save();

  return order;
};

// ========== REDUCE STOCK ==========
const reduceStock = async (productId, quantity) => {
  return await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true },
  );
};

// ========== CANCEL ORDER ==========
const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    status: { $in: ['created', 'paid'] },
  });
  if (!order) return null;
  order.status = 'cancelled';
  order.statusLogs.push({ status: 'cancelled', date: new Date() });
  await order.save();
  return order;
};

// ========== UPDATE ORDER STATUS (ADMIN) ==========
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) return null;
  order.status = status;
  order.statusLogs.push({ status, date: new Date() });
  await order.save();
  return order;
};

// ========== GET ORDER TIMELINE ==========
const getOrderTimeline = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return [];
  return order.statusLogs;
};

// ========== GET ORDER BY ID ==========
const getOrderById = async (orderId) => {
  return await Order.findById(orderId);
};

// ========== GET PRODUCT BY ID ==========
const getProductById = async (productId) => {
  return await Product.findById(productId);
};

module.exports = {
  getCartWithProducts,
  createOrder,
  addOrderItem,
  clearCart,
  getOrderWithItems,
  getOrdersByUser,
  getOrder,
  reduceStock,
  markOrderPaid,
  cancelOrder,
  updateOrderStatus,
  getOrdersByUserPaginated,
  getOrderTimeline,
  getOrderById,
  getProductById,
};
