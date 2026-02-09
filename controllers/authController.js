const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/tokenBlacklistModel');


const signup = (req, res) => {
  const { name, email, password } = req.body;

  authService.signup(name, email, password, (err) => {
    if (err) return res.status(500).json({ message: 'Server Error' , err});
    res.status(201).json({ message: 'User Created' });
  });
};

const login = (req, res) => {
  const { email, password } = req.body || {};

  authService.login(email, password, (err, token) => {
    if (err) return res.status(500).json({ message: 'Server Error' });
    if (!token) return res.status(400).json({ message: 'Invalid Credentials' });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production https
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login success' });
  });
};

// GET /api/users/me
const getMe = (req, res) => {
  authService.getProfile(req.user._id, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  });
};

// PUT or POST /users/profile
const updateMe = (req, res) => {
  const { name, email } = req.body;

  authService.updateProfile(req.user._id, name, email, (err) => {
    if (err) {
      return res.render('pages/myProfile', {
        user: req.user,
        success: null,
        error: 'Something went wrong',
      });
    }

    // update user in req
    req.user.name = name;
    req.user.email = email;

    res.render('pages/myProfile', {
      user: req.user,
      success: 'Profile updated successfully ',
      error: null,
    });
  });
};

const changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.render('pages/myProfile', {
      user: req.user,
      success: null,
      error: 'Both passwords required',
    });
  }

  if (newPassword.length < 8) {
    return res.render('pages/myProfile', {
      user: req.user,
      success: null,
      error: 'New password must be at least 8 characters',
    });
  }

  authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword,
    (err, result) => {
      if (err) {
        return res.render('pages/myProfile', {
          user: req.user,
          success: null,
          error: 'Server error',
        });
      }

      if (result === 'INVALID_CURRENT_PASSWORD') {
        return res.render('pages/myProfile', {
          user: req.user,
          success: null,
          error: 'Current password is incorrect',
        });
      }

      res.render('pages/myProfile', {
        user: req.user,
        success: 'Password changed successfully',
        error: null,
      });
    },
  );
};


const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    // 🔥 decode token here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      token,
      expiresAt,
    });

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
};
