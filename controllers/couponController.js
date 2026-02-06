const cartModel = require('../models/cartModel');
const couponService = require('../services/couponService');

// ================== ADD COUPON ==================
const addCoupon = async (req, res) => {
  try {
    const { code, discount_percent, valid_from, valid_to, min_order_amount, is_active } = req.body;

    await couponService.addCoupon({
      code,
      discount_percent,
      valid_from,
      valid_to,
      min_order_amount,
      is_active,
    });

    res.render('pages/success', {
      message: 'Coupon added successfully',
      redirect: '/admin',
    });
  } catch (err) {
    res.status(500).render('pages/generalErr', {
      message: 'Some error while adding coupon',
      err,
    });
  }
};

// ================== APPLY COUPON ==================
const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    // fetch cart
    const { items: cartItems, total: cartTotal } = await cartModel.getCartWithProducts(userId);

    if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

    const result = await couponService.applyCoupon(code, cartTotal);

    res.json({
      message: 'Coupon applied!',
      discount: result.discount,
      finalTotal: result.finalTotal,
      coupon: result.coupon,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || err });
  }
};

module.exports = { addCoupon, applyCoupon };
