const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminOrderController = require('../controllers/adminOrderController');
const adminService = require('../services/adminService');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', adminController.getDashboard);
router.get('/orders', adminController.getAllOrdersPage);

// Admin products page
router.get('/products-admin', adminController.getAllAdminProductsPage);

// Render edit product page (DYNAMIC — AFTER)
router.get('/products-admin/:id/edit', adminController.renderEditProductPage);

router.post('/orders/:id/status', adminOrderController.updateOrderStatus);
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);

// show add product page (STATIC — MUST COME FIRST)
router.get('/products-admin/add', adminController.renderAddProductPage);

// Admin product actions
// router.post(
//   '/products-admin',
//   upload.single('image'),
//   adminController.addProduct,
// );

router.post(
  '/products-admin',
  (req, res, next) => {
    next();
  },
  upload.single('image'),
  adminController.addProduct,
);

// Admin product update
router.put(
  '/products-admin/:id',
  upload.single('image'),
  adminController.updateProduct,
);

router.patch('/products-admin/:id/stock', adminController.restockProduct);

router.get('/orders-json', (req, res) => {
  adminService.fetchAllOrders((err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

router.get('/users', adminController.getAllUsersForAdmin);
router.get('/stats', adminController.getAdminStats);
router.get('/products/low-stock', adminController.getLowStockProducts);

module.exports = router;
