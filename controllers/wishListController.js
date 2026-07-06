const wishListService = require('../services/wishListService');

const getWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await wishListService.getWishList(userId);

    res.render('pages/wishlist', { wishlist: items });
  } catch (err) {
    console.error(' getWishList error:', err);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};


const addWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { product_id } = req.body;

    if (!product_id) return res.redirect('back');

    await wishListService.addWishList(userId, product_id);

    return res.redirect('/my-wishlist');
  } catch (err) {
    console.error(err);
    return res.redirect('/my-wishlist');
  }
};

const removeWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    await wishListService.removeWishList(userId, productId);

    return res.redirect('/my-wishlist');
  } catch (err) {
    console.error(err);
    return res.redirect('/my-wishlist');
  }
};

module.exports = {
  getWishList,
  addWishList,
  removeWishList,
};
