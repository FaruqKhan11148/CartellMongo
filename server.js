const express = require('express');
const dotenv = require('dotenv');

// LOAD ENV FIRST 
dotenv.config();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

// DB CONNECT AFTER ENV
const connectDB = require('./config/db');
connectDB();

// ROUTES
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRouter = require('./routes/addressRouter');
const couponRouter = require('./routes/couponRouter');
const adminRoutes = require('./routes/adminRoutes');
const wishListsRoutes = require('./routes/wishListsRoutes');
const ejsRoutes = require('./routes/ejsRoutes');
const searchProductRoutes = require('./routes/searchProductRoutes');

// MIDDLEWARES
const { errorHandler } = require('./middlewares/errorMiddleware');
const pageAuth = require('./middlewares/pageAuth');
const { protect } = require('./middlewares/authMiddleware');

// APP INIT
const app = express();

// BODY PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }),
);

// CORS
app.use(
  cors({
    origin: 'http://localhost:5000',
    credentials: true,
  }),
);

// COOKIE PARSER
app.use(cookieParser());

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// EJS SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout/main');

// APPLY PAGE AUTH GLOBALLY FOR SSR
app.use(pageAuth);

app.use(ejsRoutes);

app.get('/', protect, (req, res) => {
  res.render('pages/home');
});

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishListsRoutes);
app.use('/api/search', searchProductRoutes);

// ERROR HANDLER
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
