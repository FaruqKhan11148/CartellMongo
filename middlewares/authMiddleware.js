const jwt = require('jsonwebtoken');
const User = require('../schema/userSchema');
const TokenBlacklist = require('../models/tokenBlacklistModel');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.redirect('/signup');
  }

  try {
    // 🔥 CHECK BLACKLIST FIRST
    const blacklisted = await TokenBlacklist.findOne({ token });

    if (blacklisted) {
      return res.redirect('/signup');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('protect error:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { protect };
