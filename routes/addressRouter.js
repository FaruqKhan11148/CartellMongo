const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const addressController = require('../controllers/addressController');

router.use(protect);

// pages
router.get('/', async (req, res) => {
  await addressController.checkoutAddressPage(req, res);
});

router.get('/new', (req, res) => {
  addressController.addAddressPage(req, res);
});

router.get('/edit/:id', async (req, res) => {
  await addressController.editAddressPage(req, res);
});

// actions
router.post('/', async (req, res) => {
  await addressController.createAddress(req, res);
});
router.post('/update/:id', async (req, res) => {
  await addressController.updateAddress(req, res);
});
router.post('/delete/:id', async (req, res) => {
  await addressController.deleteAddress(req, res);
});

module.exports = router;
