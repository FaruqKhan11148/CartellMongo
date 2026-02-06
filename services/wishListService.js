const mongoose = require('mongoose');
const wishListModel = require('../models/wishListModel');

// const getWishList = async (userId) => {
//   return await wishListModel.findByUserId(userId); // Mongoose casts string -> ObjectId
// };

const getWishList = async (userId) => {
  const data = await wishListModel.findByUserId(userId);
  return data;
};

const addWishList = async (userId, productId) => {
  const alreadyExists = await wishListModel.exists(userId, productId);
  if (alreadyExists) throw new Error('Already in wishlist');
  await wishListModel.createItem(userId, productId);
};

const removeWishList = async (userId, productId) => {
  const removed = await wishListModel.removeItem(userId, productId);
  if (!removed) throw new Error('Failed to remove wishlist item');
};

module.exports = {
  getWishList,
  addWishList,
  removeWishList,
};
