const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Ensure the required environment variables are available
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Error: Missing Google Client ID or Secret in environment variables');
}

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: 'https://mini-crm-backend-flem.onrender.com/api/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const newUser = {
//         googleId: profile.id,
//         displayName: profile.displayName,
//         firstName: profile.name.givenName,
//         lastName: profile.name.familyName,
//         image: profile.photos[0].value,
//         email: profile.emails[0].value,
//       };

//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (user) {
//           // User exists, update profile
//           user = await User.findOneAndUpdate({ googleId: profile.id }, newUser, { new: true });
//           return done(null, user);
//         } else {
//           // Create new user
//           user = await new User(newUser).save();
//           return done(null, user);
//         }
//       } catch (err) {
//         console.error('Error finding or creating user:', err);
//         return done(err, null);
//       }
//     }
//   )
// );

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://mini-crm-backend-flem.onrender.com/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Access Token:', accessToken);
      console.log('Profile:', profile);

      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        image: profile.photos[0].value,
        email: profile.emails[0].value,
      };

      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('User Found:', user);
          user = await User.findOneAndUpdate({ googleId: profile.id }, newUser, { new: true });
          return done(null, user);
        } else {
          console.log('Creating New User');
          user = await new User(newUser).save();
          return done(null, user);
        }
      } catch (err) {
        console.error('Error in OAuth Callback:', err);
        return done(err, null);
      }
    }
  )
);


// passport.serializeUser((user, done) => {
//   done(null, user.id); // Only user ID is stored in the session
// });

passport.serializeUser((user, done) => {
  console.log('Serializing User:', user);
  done(null, user.id); // Only user ID is stored in the session
});

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     console.error('Error deserializing user:', err);
//     done(err, null);
//   }
// });

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserializing User:', user);
    done(null, user);
  } catch (err) {
    console.error('Error Deserializing User:', err);
    done(err, null);
  }
});

module.exports = passport;
