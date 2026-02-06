const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderStatusLogSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon: { type: String, default: null },
    shippingAddress: { type: Object, required: true },
    status: { type: String, default: 'created' }, // created, paid, cancelled, delivered, etc.
    statusLogs: [orderStatusLogSchema],
    paymentStatus: { type: String, default: 'pending' }, // pending, success
    paymentMethod: { type: String, default: null },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
