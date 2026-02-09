const Order = require("../models/orderModel");

const hasPurchased = await Order.findOne({
  user: req.user._id,
  "items.product": productId,
  status: "Delivered",
});

if (!hasPurchased) {
  return res.status(403).json({
    message: "You can only review purchased products",
  });
}
