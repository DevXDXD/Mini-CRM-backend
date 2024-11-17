const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db.config'); 
const passport = require('./services/auth.service'); 
const MongoStore = require('connect-mongo');

require('dotenv').config();

const app = express();
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',  // This allows all origins
  credentials: true  // This is typically used with cookies or HTTP authentication, but it may be set to false if not needed
}));
app.use(express.json()); 

// Session management

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } 
// }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // MongoDB connection string
    ttl: 24 * 60 * 60 // Set time to live (in seconds)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (24 hours in ms)
  },
}));

// Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/orders', require('./routes/order.routes')); 
app.use('/api/campaigns', require('./routes/campaign.routes'));
app.use('/api/admin', require('./routes/admin.routes'));


require('./services/scheduler');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
