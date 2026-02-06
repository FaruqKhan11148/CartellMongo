// const adminOnly = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Admin access only' });
//   }
//   next();
// };

// module.exports = { adminOnly };

const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).render("pages/error", {
      title: "Admin Only",
      message: "This area is restricted to administrators only.",
      redirect: "/"
    });
  }
};

module.exports = { adminOnly };
