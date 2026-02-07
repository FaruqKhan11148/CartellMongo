const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

const orderController = require('../controllers/orderController');
const adminOrderController = require('../controllers/adminOrderController');

// USER ORDER ROUTES

// Place order
router.post('/checkout', protect, orderController.checkout);

// checkout single
router.post('/checkout-single', protect, orderController.checkoutSingle);

// Get my orders (paginated)
router.get('/', protect, orderController.getMyOrdersPaginated);

// Get my orders (non-paginated – optional / legacy)
router.get('/my', protect, orderController.getMyOrders);

// Order timeline (specific)
router.get('/:id/timeline', protect, orderController.getOrderTimeline);

// Cancel order (specific)
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// Pay multiple
router.post('/pay-multiple', protect, orderController.payMultipleOrders);

// Get single order (generic → MUST BE LAST)
router.get('/:orderId', protect, orderController.getOrderById);

// ADMIN ORDER ROUTES
router.post(
  '/order/:id/status',
  protect,
  adminOnly,
  adminOrderController.updateOrderStatus,
);

module.exports = router;
