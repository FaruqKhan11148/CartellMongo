const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  discount_percent: { type: Number, required: true },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  min_order_amount: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
