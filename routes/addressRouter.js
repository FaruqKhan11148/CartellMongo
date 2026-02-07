const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const addressController = require('../controllers/addressController');

router.use(protect);

// pages
router.get('/', async (req, res) => {
  console.log('GET /addresses called', req.user._id);
  await addressController.checkoutAddressPage(req, res);
});

router.get('/new', (req, res) => {
  console.log('GET /addresses/new called');
  addressController.addAddressPage(req, res);
});

router.get('/edit/:id', async (req, res) => {
  console.log('GET /addresses/edit', req.params.id);
  await addressController.editAddressPage(req, res);
});

// actions
router.post('/', async (req, res) => {
  console.log('POST /addresses create', req.body);
  await addressController.createAddress(req, res);
});
router.post('/update/:id', async (req, res) => {
  console.log('POST /addresses/update', req.params.id, req.body);
  await addressController.updateAddress(req, res);
});
router.post('/delete/:id', async (req, res) => {
  console.log('POST /addresses/delete', req.params.id);
  await addressController.deleteAddress(req, res);
});

module.exports = router;
