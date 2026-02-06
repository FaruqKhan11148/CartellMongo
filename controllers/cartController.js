const cartService = require('../services/cartService');

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    await cartService.addToCart(userId, productId, quantity);

    res.redirect('/my-cart');
  } catch (err) {
    console.error('CART ERROR:', err);
    res.render('pages/error', {
      title: 'Cart Error',
      message: 'Unable to add item to cart',
      redirect: '/my-cart'
    });
  }
};


const remove = async (req, res) => {
  try {
    const { productId } = req.body;
    await cartService.removeItem(req.user._id, productId);

    res.redirect('/my-cart');
  } catch (err) {
    res.render('pages/error', {
      title: 'Cart Error',
      message: 'Unable to remove item from cart',
      redirect: '/my-cart'
    });
  }
};

const view = async (req, res) => {
  try {
    const cartItems = await cartService.viewCart(req.user._id);
    res.render('pages/myCart', { cartItems });
  } catch (err) {
    res.status(500).render('pages/error', {
      title: 'Cart Error 🛒',
      message: 'Failed to fetch your cart items.',
      redirect: '/',
    });
  }
};


// NEW: view cart with total
const getMyCart = (req, res) => {
  cartService.viewCartWithTotal(req.user._id, (err, data) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(data);
  });
};

module.exports = { addToCart, remove, view, getMyCart };
