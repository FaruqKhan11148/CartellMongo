const Coupon = require('../models/couponModel');

// ADD COUPON
const addCoupon = async (couponData) => {
  const coupon = new Coupon(couponData);
  return await coupon.save();
};

// APPLY COUPON
const applyCoupon = async (code, cartTotal) => {
  const coupon = await Coupon.findOne({ code, is_active: true });
  if (!coupon) throw new Error('Invalid or inactive coupon');

  const today = new Date();
  if (today < coupon.valid_from || today > coupon.valid_to) {
    throw new Error('Coupon expired');
  }

  if (cartTotal < coupon.min_order_amount) {
    throw new Error(`Cart total must be at least ${coupon.min_order_amount}`);
  }

  const discount = (cartTotal * coupon.discount_percent) / 100;
  const finalTotal = cartTotal - discount;

  return { discount, finalTotal, coupon };
};

module.exports = { addCoupon, applyCoupon };
