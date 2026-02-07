const Cart = require('../schema/cartSchema');
const Product = require('../schema/productSchema');
const Coupon = require('../models/couponModel');
const Address = require('../models/addressModel');
const Order = require('../schema/orderSchema');

// =================== PLACE ORDER ===================
const checkout = async (req, res) => {
  const userId = req.user._id;
  const { address_id, coupon_code } = req.body;

  if (!address_id)
    return res.status(400).json({ message: 'Address is required' });

  try {
    // Get user's cart items
    const cartItems = await Cart.find({ user: userId }).populate('product');
    if (!cartItems.length)
      return res.status(400).json({ message: 'Cart is empty' });

    // Check stock
    const outOfStock = cartItems.filter((c) => c.quantity > c.product.stock);
    if (outOfStock.length)
      return res.status(400).json({
        message: `Stock exceeded for products: ${outOfStock.map((p) => p.product.name).join(', ')}`,
      });

    // Calculate total
    let total = cartItems.reduce(
      (sum, c) => sum + c.quantity * c.product.price,
      0,
    );

    // Apply coupon if exists
    let discount = 0;
    let appliedCoupon = null;
    if (coupon_code) {
      const coupon = await Coupon.findOne({
        code: coupon_code,
        is_active: true,
      });
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon' });
      if (total < coupon.min_order_amount)
        return res.status(400).json({
          message: `Cart total must be at least ${coupon.min_order_amount}`,
        });
      discount = (total * coupon.discount_percent) / 100;
      total -= discount;
      appliedCoupon = coupon;
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: cartItems.map((c) => ({
        product: c.product._id,
        quantity: c.quantity,
        price: c.product.price,
      })),
      total,
      discount,
      coupon: appliedCoupon?._id || null,
      shippingAddress: address_id,
      status: 'pending',
      statusLogs: [{ status: 'pending', date: new Date() }],
    });

    // Deduct stock
    for (const item of cartItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          message: `Stock changed for ${item.product.name}, please retry`,
        });
      }
    }

    // Clear user's cart
    await Cart.deleteMany({ user: userId });

    res.render('pages/success', {
      message: 'Order Placed Successfully',
      redirect: '/my-orders',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order Failed', error: err.message });
  }
};

// =================== SINGLE PRODUCT ORDER ===================
const checkoutSingle = async (req, res) => {
  const userId = req.user._id;
  const { productId, address_id } = req.body;

  if (!productId || !address_id)
    return res.status(400).json({ message: 'Missing data' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < 1)
      return res.status(400).json({ message: 'Out of stock' });

    const order = await Order.create({
      user: userId,
      items: [{ product: product._id, quantity: 1, price: product.price }],
      total: product.price,
      shippingAddress: address_id,
      status: 'pending',
      statusLogs: [{ status: 'pending', date: new Date() }],
    });

    // Reduce stock
    const updated = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { new: true },
    );

    if (!updated) return res.status(400).json({ message: 'Out of stock' });

    res.render('pages/success', {
      message: 'Order Placed Successfully',
      redirect: '/my-orders',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order Failed', error: err.message });
  }
};

// =================== GET SINGLE ORDER ===================
const getOrderById = async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      'items.product',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// =================== GET USER ORDERS ===================
const getMyOrders = async (req, res) => {
  const userId = req.user._id;
  try {
    let orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product');

    // Filter out delivered orders older than 2 days
    const now = new Date();
    orders = orders.filter((order) => {
      if (order.status !== 'delivered') return true;
      const deliveredDate = new Date(order.createdAt);
      const diffHours = (now - deliveredDate) / (1000 * 60 * 60);
      return diffHours <= 48;
    });

    res.render('pages/myOrders', { orders });
  } catch (err) {
    console.error(err);
    res.render('pages/myOrders', { orders: [] });
  }
};

// =================== MARK ORDER PAID ===================
const markPaid = async (req, res) => {
  const { orderId } = req.params;
  const { method, transaction_id } = req.body;

  if (!method || !transaction_id)
    return res.status(400).json({ message: 'Payment details required' });

  try {
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'paid')
      return res.status(400).json({ message: 'Order already paid' });

    order.status = 'paid';
    order.paymentStatus = 'success';
    order.paymentMethod = method;
    order.transactionId = transaction_id;

    order.statusLogs.push({ status: 'paid', date: new Date() });

    await order.save();

    res.json({
      message: 'Payment updated successfully',
      orderId,
      status: 'paid',
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Payment update failed', error: err.message });
  }
};

// =================== CANCEL ORDER ===================
const cancelOrder = async (req, res) => {
  const { id: orderId } = req.params;
  try {
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['paid', 'shipped', 'delivered'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel this order' });

    order.status = 'cancelled';
    order.statusLogs.push({ status: 'cancelled', date: new Date() });
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =================== GET USER ORDERS PAGINATED ===================
const getMyOrdersPaginated = async (req, res) => {
  const userId = req.user._id;
  let { page = 1, limit = 5 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product');

    const totalOrders = await Order.countDocuments({ user: userId });

    res.json({
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

// =================== GET ORDER TIMELINE ===================
const getOrderTimeline = async (req, res) => {
  const userId = req.user._id;
  const { id: orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).render('pages/timeline', {
        orderId,
        timeline: [],
        error: 'Order not found',
      });
    }

    res.render('pages/timeline', {
      orderId,
      timeline: order.statusLogs || [],
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/timeline', {
      orderId,
      timeline: [],
      error: err.message,
    });
  }
};

// =================== PAY MULTIPLE ORDERS ===================
const payMultipleOrders = async (req, res) => {
  let { orderIds, method, transaction_id } = req.body;

  if (typeof orderIds === 'string') orderIds = JSON.parse(orderIds);

  if (!orderIds?.length || !method || !transaction_id) {
    return res.status(400).json({ message: 'Missing data' });
  }

  try {
    for (let id of orderIds) {
      const order = await Order.findOne({ _id: id, user: req.user._id });

      if (!order) continue; // skip if order not found
      if (order.status === 'paid') continue; // skip if already paid

      order.status = 'paid';
      order.paymentStatus = 'success';
      order.paymentMethod = method;
      order.transactionId = transaction_id;

      order.statusLogs.push({ status: 'paid', date: new Date() });

      await order.save();
    }

    res.render('pages/success', {
      message: 'Payment successful for selected orders',
      redirect: '/my-orders',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};

module.exports = {
  checkout,
  getOrderById,
  getMyOrders,
  markPaid,
  cancelOrder,
  getMyOrdersPaginated,
  getOrderTimeline,
  payMultipleOrders,
  checkoutSingle,
};
