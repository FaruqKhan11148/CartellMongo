const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const searchText = req.query.q || '';

    const results = await productService.searchProducts(searchText);

    res.render('pages/searchResults', {
      products: results || [],
      searchText,
    });
  } catch (err) {
    console.log(err);
    res.render('pages/searchResults', {
      products: [],
      searchText: req.query.q || '',
    });
  }
});

module.exports = router;
