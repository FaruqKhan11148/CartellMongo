const Cart = require('../schema/cartSchema');
const Product = require('../schema/productSchema');
const mongoose = require('mongoose');

const addToCart = async (userId, productId, quantity = 1) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const pid = new mongoose.Types.ObjectId(productId);

  const product = await Product.findById(pid);
  if (!product) throw new Error('Product not found');
  if (quantity > product.stock) throw new Error('Out of stock');

  const existingItem = await Cart.findOne({ user: uid, product: pid });

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    return await existingItem.save();
  }

  return await Cart.create({
    user: uid,
    product: pid,
    quantity: Number(quantity),
  });
};

const removeItem = async (userId, productId) => {
  return await Cart.findOneAndDelete({
    user: userId,
    product: productId,
  });
};

const viewCart = async (userId) => {
  return await Cart.find({ user: userId })
    .populate('product', 'name price image_url stock')
    .lean();
};

const viewCartWithTotal = async (userId) => {
  const items = await viewCart(userId);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  return { items, total };
};

module.exports = { addToCart, removeItem, viewCart, viewCartWithTotal };
