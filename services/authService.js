const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const dotenv = require('dotenv');
const TokenBlacklist = require('../models/tokenBlacklistModel');
const db = require('../config/db');
dotenv.config();

// signup
const signup = async (name, email, password, callback) => {
  const hashedPassword = await bcrypt.hash(password, 11);
  userModel.createUser({ name, email, password: hashedPassword }, callback);
};

// login
const login = async (email, password, callback) => {
  userModel.findUserByEmail(email, async (err, results) => {
    if (err) return callback(err);
    if (!results.length) return callback(null, null);

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return callback(null, null);

    const token = jwt.sign(
      {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        role: results[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    callback(null, token);
  });
};

// GET PROFILE
const getProfile = (userId, callback) => {
  userModel.getUserById(userId, (err, results) => {
    if (err) return callback(err);

    if (results.length === 0) {
      return callback(null, null);
    }

    callback(null, results[0]);
  });
};

// UPDATE PROFILE
const updateProfile = (userId, name, email, callback) => {
  userModel.updateUserProfile(userId, name, email, callback);
};

// Change Password
const changePassword = async (
  userId,
  currentPassword,
  newPassword,
  callback,
) => {
  userModel.getUserPasswordById(userId, async (err, results) => {
    if (err) return callback(err);
    if (!results.length) return callback(null, false);

    const hashedPassword = results[0].password;

    // verify old password
    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isMatch) return callback(null, 'INVALID_CURRENT_PASSWORD');

    // hash new password
    const newHashed = await bcrypt.hash(newPassword, 11);

    // update DB
    userModel.updateUserPassword(userId, newHashed, callback);
  });
};

const logout = async (token, decoded, callback) => {
  try {
    if (!token || !decoded) {
      return callback(new Error('Invalid token'));
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      token,
      expiresAt,
    });

    callback(null, true);
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
