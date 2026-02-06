const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const Coupon = require('../models/couponModel');
const Product = require('../models/productModel');

// =================== FETCH CART ===================
const fetchCart = async (userId) => {
  const cartItems = await Cart.find({ user: userId }).populate('product');
  if (!cartItems.length) throw new Error('Cart empty');
  return cartItems;
};

// =================== VALIDATE ADDRESS ===================
const validateAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new Error('Invalid address');
  return address;
};

// =================== APPLY COUPON ===================
const applyCoupon = async (coupon_code, total) => {
  if (!coupon_code) return { finalTotal: total, discount: 0 };

  const coupon = await Coupon.findOne({ code: coupon_code, is_active: true });
  if (!coupon) throw new Error('Invalid or inactive coupon');

  const now = new Date();
  if (now < coupon.valid_from || now > coupon.valid_to)
    throw new Error('Coupon expired');

  if (total < coupon.min_order_amount)
    throw new Error(`Cart total must be at least ${coupon.min_order_amount}`);

  const discount = (total * coupon.discount_percent) / 100;
  return { finalTotal: total - discount, discount };
};

// =================== CREATE ORDER AND ITEMS ===================
const createOrderAndItems = async (userId, cartItems, shippingAddress, coupon_code, total, discount) => {
  const order = new Order({
    user: userId,
    items: [],
    total,
    discount,
    coupon: coupon_code || null,
    shippingAddress,
    status: 'created',
    statusLogs: [{ status: 'created', date: new Date() }],
  });

  for (let item of cartItems) {
    // reduce product stock
    const product = await Product.findById(item.product._id);
    if (!product || product.stock < item.quantity) {
      throw { message: 'Insufficient stock', productId: item.product._id };
    }
    product.stock -= item.quantity;
    await product.save();

    order.items.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  await order.save();

  // clear user's cart
  await Cart.deleteMany({ user: userId });

  return { orderId: order._id, total, discount };
};

// =================== PLACE ORDER ===================
const placeOrder = async (userId, addressId, coupon_code) => {
  const cartItems = await fetchCart(userId);
  const shippingAddress = await validateAddress(userId, addressId);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let finalTotal = cartTotal;
  let discount = 0;

  if (coupon_code) {
    try {
      const couponResult = await applyCoupon(coupon_code, cartTotal);
      finalTotal = couponResult.finalTotal;
      discount = couponResult.discount;
    } catch (err) {
      // ignore invalid coupon
      console.warn('Coupon ignored:', err.message);
    }
  }

  return createOrderAndItems(userId, cartItems, shippingAddress, coupon_code, finalTotal, discount);
};

// =================== PLACE SINGLE PRODUCT ORDER (BUY NOW) ===================
const placeSingleProductOrder = async (userId, productId, addressId) => {
  // Validate address
  const shippingAddress = await Address.findOne({ _id: addressId, user: userId });
  if (!shippingAddress) throw new Error('Invalid address');

  // Get product
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  if (product.stock < 1) throw new Error('Out of stock');

  // Prepare order item
  const cartItems = [
    {
      product: product._id,
      quantity: 1,
      price: product.price,
    },
  ];
  const total = product.price;
  const discount = 0;

  // Reduce stock
  product.stock -= 1;
  await product.save();

  // Create order
  const order = new Order({
    user: userId,
    items: cartItems,
    total,
    discount,
    coupon: null,
    shippingAddress,
    status: 'created',
    statusLogs: [{ status: 'created', date: new Date() }],
  });

  await order.save();

  return { orderId: order._id, total, discount };
};

// =================== GET SINGLE ORDER ===================
const getOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
  if (!order) throw new Error('Order not found');
  return order;
};

// =================== GET ALL ORDERS OF USER ===================
const getOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product');
  return { orders };
};

// =================== CANCEL ORDER ===================
const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error('Order not found or access denied');

  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw new Error('Order cannot be cancelled');
  }

  order.status = 'cancelled';
  order.statusLogs.push({ status: 'cancelled', date: new Date() });
  await order.save();

  return 'Order cancelled';
};

// =================== GET ORDERS PAGINATED ===================
const getOrdersPaginated = async (userId, page = 1, limit = 5) => {
  const skip = (page - 1) * limit;
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product');

  return orders;
};

// =================== GET ORDER TIMELINE ===================
const getOrderTimeline = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error('Order not found or access denied');

  return order.statusLogs;
};

module.exports = {
  placeOrder,
  getOrder,
  getOrders,
  cancelOrder,
  getOrdersPaginated,
  getOrderTimeline,
  placeSingleProductOrder
};
