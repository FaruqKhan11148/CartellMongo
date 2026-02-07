const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('../config/db');
const User = require('../schema/userSchema');

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ THIS NOW WORKS
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

// check blacklist (optional for every protected route)
const isBlacklisted = (token, callback) => {
  const sql = `SELECT id FROM token_blacklist WHERE token = ?`;
  db.query(sql, [token], (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0);
  });
};

module.exports = { protect, isBlacklisted };
