const express = require("express");
require('dotenv').config();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const { Movie, User } = require("./models");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));


const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files /documentation will work automatically
app.use(morgan("common")); // "common" muestra logs básicos
app.use(cors());

let auth = require('./auth')(app);
require('./passport');

const passport = require('passport');

// Homepage
app.get("/", (req, res) => {
  res.send("Welcome to the Movie API!");
});

// GET All Movies (from MongoDB)
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movie.find(); // Fetch all movies
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single movie by title
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title }); // Find movie by title
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get genre details by name
app.get("/genres/:name", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log(`Looking for genre: ${req.params.name}`);
    const movie = await Movie.findOne({ "genre.name": req.params.name });
    console.log(`Found movie:`, movie);

    if (!movie) return res.status(404).json({ message: "Genre not found" });

    res.json(movie.genre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/directors/:name", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log(`Received request for director: ${req.params.name}`); // Debugging log
    const movies = await Movie.find({ "director.name": req.params.name });

    console.log(`MongoDB query result:`, movies); // Log what MongoDB returns

    if (!movies || movies.length === 0) {
      console.log(`Director ${req.params.name} not found in database.`);
      return res.status(404).json({ message: "Director not found" });
    }

    res.json(movies);
  } catch (err) {
    console.error(`Error fetching director: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Register a new user
app.post("/users", 
  [
    check("username", "Username must be at least 5 characters long").isLength({ min: 5 }),
    check("username", "Username must be alphanumeric").isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email must be valid").isEmail(),
  ],
  async (req, res) => {
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday,
      });

      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update user info
app.put("/users/:username", passport.authenticate('jwt', { session: false }),
  [
    check("username", "Username must be at least 5 characters long").isLength({ min: 5 }),
    check("username", "Username must be alphanumeric").isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email must be valid").isEmail(),
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.user.username !== req.params.username) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }
  

    try {
      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Add a movie to user's favorite list
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), 
  [
    check('username', 'Username must be provided').notEmpty(),
    check('movieId', 'Movie ID must be a valid Mongo ID').isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  try {
      console.log('Received request to add movie to favorites');
      console.log('username:', req.params.username);
      console.log('Movie ID:', req.params.movieId);

      const updatedUser = await User.findOneAndUpdate(
          { username: req.params.username },
          { $addToSet: { favoriteMovies: req.params.movieId } }, // Prevent duplicates
          { new: true }
      );

      if (!updatedUser) {
          console.log('User not found');
          return res.status(404).json({ message: 'User not found' });
      }

      console.log('Updated user:', updatedUser);
      res.json(updatedUser);
  } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: err.message });
  }
});


// Remove a movie from user’s favorite list
app.delete("/users/:username/movies/:movieId", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log("Deleting movie from favorites...");
    console.log("username:", req.params.username);
    console.log("Movie ID:", req.params.movieId);

    const movieId = new mongoose.Types.ObjectId(req.params.movieId); // Convert to ObjectId

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { favoriteMovies: movieId } }, // Pull using ObjectId
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", updatedUser);
    res.json(updatedUser);
  } catch (err) {
    console.error("Error deleting movie from favorites:", err);
    res.status(500).json({ error: err.message });
  }
});

// Deregister a user
app.delete("/users/:username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      username: req.params.username,
    });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${req.params.username} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/documentation", (req, res) => {
  res.sendFile(__dirname + "/public/documentation.html");
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong! Please try again later.");
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
