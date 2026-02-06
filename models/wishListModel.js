const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const wishListSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Static methods
wishListSchema.statics.findByUserId = async function (userId) {
  const docs = await this.find({ user_id: userId }).populate(
    'product_id',
    'name price image_url stock',
  );
  return docs;
};

wishListSchema.statics.exists = async function (userId, productId) {
  const doc = await this.findOne({ user_id: userId, product_id: productId });
  return !!doc;
};

wishListSchema.statics.createItem = async function (userId, productId) {
  return this.create({ user_id: userId, product_id: productId });
};

wishListSchema.statics.removeItem = async function (userId, productId) {
  const result = await this.deleteOne({
    user_id: userId,
    product_id: productId,
  });
  return result.deletedCount > 0;
};

module.exports = model('WishList', wishListSchema);
