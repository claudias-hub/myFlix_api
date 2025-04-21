const passport = require('passport');
const passportJWT = require('passport-jwt');

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const bcrypt = require('bcryptjs');
const Models = require('./models.js');
const Users = Models.User




// Local Strategy: Username + Password authentication
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
            return done(null, false, { message: 'Incorrect username or password.' });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            console.log('Incorrect password');
            return done(null, false, { message: 'Incorrect username or password.' });
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


// JWT Strategy: Token authentication
passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret', // Use environment variable in real apps
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