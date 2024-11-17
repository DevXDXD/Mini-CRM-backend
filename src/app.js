const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const passport = require('./services/auth.service'); // Your Passport setup
const connectDB = require('./config/db.config'); // Your MongoDB connection
require('dotenv').config();

const app = express();
connectDB(); // Connect to MongoDB

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow sending cookies with credentials
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60, // Session expiration: 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      httpOnly: true, // Prevent access via JavaScript
      sameSite: 'none', // Required for cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);

// Debugging middleware to log Set-Cookie headers
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('Set-Cookie Header:', res.getHeaders()['set-cookie']);
  });
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth.routes'); // Your auth routes
app.use('/api/auth', authRoutes);

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
