const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).render('pages/error', {
      title: 'Admin Only',
      message: 'This area is restricted to administrators only.',
      redirect: '/',
    });
  }
};

module.exports = { adminOnly };
