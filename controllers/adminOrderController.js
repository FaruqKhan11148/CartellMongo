const orderModel = require('../models/orderModel');

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status: newStatus } = req.body;

    const order = await orderModel.getOrderById(orderId);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const currentStatus = order.status;
    const paymentStatus = order.paymentStatus;

    // PAYMENT GATE
    const deliveryStatuses = ['shipped', 'out_for_delivery', 'delivered'];

    if (
      deliveryStatuses.includes(newStatus) &&
      paymentStatus !== 'success'
    ) {
      return res.status(400).send('Order must be paid first');
    }

    // STATUS FLOW
    const allowedTransitions = {
      created: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return res
        .status(400)
        .send(`Invalid transition ${currentStatus} → ${newStatus}`);
    }

    // UPDATE ORDER
    await orderModel.updateOrderStatus(orderId, newStatus);

    res.redirect('/api/admin/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Status update failed');
  }
};
