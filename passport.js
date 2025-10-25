// passport.js

const passport = require('passport');
const passportJWT = require('passport-jwt');

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const jwtSecret = process.env.JWT_SECRET;
const ExtractJWT = passportJWT.ExtractJwt;

const bcrypt = require('bcrypt');
const Models = require('./models.js');
const Users = Models.User


/**
 * ADDED: Local Strategy for username/password authentication.
 * Looks up user by username and verifies password using model's validatePassword.
 * On success, `done(null, user)`; on failure, `done(null, false, { message })`.
 */
passport.use(
   new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          console.log("Looking for user:", username);
  
        
          const user = await Users.findOne({ username: username });

          if (!user) {
            console.log('Incorrect username');
            return done(null, false, { message: 'Incorrect username.' });
          }

          const isMatch = await user.validatePassword(password);
          if (!isMatch) {
            console.log('Incorrect password');
            return done(null, false, { message: 'Incorrect password.' });
          }

          console.log('Authentication successful');
          return done(null, user);
        } catch (error) {
          console.error('Error during authentication:', error);
          return done(error);
        }
      }
    )
 );



/**
 * ADDED: JWT Strategy for Bearer token authentication.
 * Extracts token from Authorization header, verifies, and loads user by _id in payload.
 * On success, `done(null, user)`; if not found, `done(null, false)`.
 */
passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret, // Use environment variable in real apps
      },
      async (jwtPayload, done) => {
        try {
          const user = await Users.findById(jwtPayload._id);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );