const jwtSecret = process.env.JWT_SECRET;

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");
const express = require("express");
const router = express.Router();

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // This is the username you’re encoding in the JWT
    expiresIn: "30d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
module.exports = (app) => {
  app.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      console.log("Login error:", error);
      console.log("User found:", user);
      console.log("Passport info:", info);
  
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
          info: info
        });
      }
  
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.send(error);
        }
  
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });    
};
  
