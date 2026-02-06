// const mongoose = require('mongoose');
// const Cart = require('../schema/cartSchema');
// const Product = require('../schema/productSchema');

// const addToCart = async (userId, productId, quantity) => {
//   const uid = mongoose.Types.ObjectId(userId);
//   const pid = mongoose.Types.ObjectId(productId);

//   // check stock
//   const product = await Product.findById(pid);
//   if (!product) throw new Error('Product not found');
//   if (quantity > product.stock) throw new Error('Quantity exceeds stock');

//   // add or update cart
//   const existing = await Cart.findOne({ user: uid, product: pid });
//   if (existing) {
//     existing.quantity += quantity;
//     return await existing.save();
//   } else {
//     const newItem = new Cart({ user: uid, product: pid, quantity });
//     return await newItem.save();
//   }
// };

// const removeFromCart = async (userId, productId) => {
//   const uid = mongoose.Types.ObjectId(userId);
//   const pid = mongoose.Types.ObjectId(productId);
//   return await Cart.findOneAndDelete({ user: uid, product: pid });
// };

// const getCart = async (userId) => {
//   const uid = mongoose.Types.ObjectId(userId);
//   return await Cart.find({ user: uid }).populate('product').lean();
// };

// const getCartWithProducts = async (userId) => {
//   const items = await getCart(userId);
//   const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
//   return { items, total };
// };

// module.exports = { addToCart, removeFromCart, getCart, getCartWithProducts };
