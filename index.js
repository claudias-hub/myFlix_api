// index.js

const express = require("express");
require('dotenv').config();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const { Movie, User } = require("./models");
const allowedOrigins = [
  'http://localhost:4200', 
  'http://localhost:1234', 
  'https://movie-api-w67x.onrender.com', 
  'https://myflix-by-clau.netlify.app', 
  'https://claudias-hub.github.io'];

  /**
 * Connect to MongoDB Atlas using MONGO_URI from environment.
 * Logs a confirmation on success and prints an error on failure.
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));


const app = express();
const port = process.env.PORT || 8080;

/**
 * Global middleware:
 * - bodyParser: parse JSON and URL-encoded payloads
 * -morgan: request logging
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common")); // "common" muestra logs básicos

/**
 * CORS middleware BEFORE auth to allow configured origins only.
 * Allows tools like curl/Postman (no origin).
 */
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser tools or same-origin (like curl/Postman) where origin may be undefined
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

//Handle preflight requests
app.options('*', cors());

// NOW load auth (which adds /login route)
let auth = require('./auth')(app);
require('./passport');

const passport = require('passport');

//Static files
app.use(express.static("public"));


// Homepage
/**
 * @route GET /
 * @summary Health/welcome endpoint
 * @description Returns a welcome message confirming the API is reachable.
 * @returns {string} 200 - Plain text welcome message
 */
app.get("/", async (req, res) => {
  res.send("Welcome to the Movie API!");
});

// Favicon route to prevent 404 errors in logs
app.get('/favicon.ico', (req, res) => res.status(204).end());


// GET All Movies (from MongoDB)
/**
 * @route GET /movies
 * @summary Get a paginated list of movies
 * @security JWT
 * @description Returns movies with optional pagination via `page` and `limit` query params.
 * @param {number} [req.query.page] - Page number (default 1)
 * @param {number} [req.query.limit] - Page size (default 20)
 * @returns {Movie[]} 200 - Array of movie documents
 * @returns {object} 500 - Error object
 */
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const movies = await Movie.find().skip(skip).limit(limit);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a single movie by title
/**
 * @route GET /movies/:title
 * @summary Get a single movie by title
 * @security JWT
 * @param {string} req.params.title - Movie title
 * @returns {Movie} 200 - Movie document
 * @returns {object} 404 - Not found message
 * @returns {object} 500 - Error object
 */
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title }); // Find movie by title
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a movie by ID
/**
 * @route GET /movies/id/:id
 * @summary Get a single movie by MongoDB ObjectId
 * @security JWT
 * @param {string} req.params.id - Movie ObjectId
 * @returns {Movie} 200 - Movie document
 * @returns {object} 404 - Not found message
 * @returns {object} 500 - Error object
 */
app.get("/movies/id/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get genre details by name
/**
 * @route GET /genres/:name
 * @summary Get genre details by genre name
 * @security JWT
 * @param {string} req.params.name - Genre name
 * @returns {object} 200 - Genre subdocument
 * @returns {object} 404 - Not found message
 * @returns {object} 500 - Error object
 */
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

// Get director details by name
/**
 * @route GET /directors/:name
 * @summary Get movies by a director's name
 * @security JWT
 * @param {string} req.params.name - Director name
 * @returns {Movie[]} 200 - Array of movies directed by given director
 * @returns {object} 404 - Not found message
 * @returns {object} 500 - Error object
 */
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
/**
 * @route POST /users
 * @summary Register a new user
 * @description Validates input, hashes password, and creates a user.
 * @param {string} req.body.username - Alphanumeric username (min 5 chars)
 * @param {string} req.body.password - Plain text password
 * @param {string} req.body.email - Valid email
 * @param {string} [req.body.birthday] - ISO date string (optional)
 * @returns {User} 201 - Created user document
 * @returns {object} 400 - Username exists
 * @returns {object} 422 - Validation errors
 * @returns {object} 500 - Error object
 */
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

      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

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
/**
 * @route PUT /users/:username
 * @summary Update an existing user (self only)
 * @security JWT
 * @description Allows updating email, birthday, and password (optional).
 * @param {string} req.params.username - Username to update
 * @param {string} [req.body.password] - New password (optional)
 * @param {string} req.body.email - New email
 * @param {string} [req.body.birthday] - New ISO date (optional)
 * @returns {User} 200 - Updated user document
 * @returns {object} 403 - Forbidden if not self
 * @returns {object} 404 - User not found
 * @returns {object} 422 - Validation errors
 * @returns {object} 500 - Error object
 */
app.put("/users/:username", passport.authenticate('jwt', { session: false }),
  [
    check("password", "Password is required").optional(), // Make password optional for updates
    check("email", "Email must be valid").isEmail(),
    check("birthday", "Birthday must be a valid date").optional().isISO8601(),
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.user.username !== req.params.username) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }
  

    try {
      // Build update object safely
      const updateData = {
        email: req.body.email,
        birthday: req.body.birthday
      };

      // Only hash and add password if provided
      if (req.body.password) {
        updateData.password = bcrypt.hashSync(req.body.password, 10);
      }

      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $set: updateData },
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
/**
 * @route POST /users/:username/movies/:movieId
 * @summary Add a movie to a user's favorites
 * @security JWT
 * @param {string} req.params.username - Username
 * @param {string} req.params.movieId - Movie ObjectId
 * @returns {User} 200 - Updated user document with favorites
 * @returns {object} 404 - User not found
 * @returns {object} 422 - Validation errors
 * @returns {object} 500 - Error object
 */
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), 
  [
    check('username', 'Username must be provided').notEmpty(),
    check('movieId', 'Movie ID must be a valid Mongo ID').isMongoId(),
  ], 
  async (req, res) => {
    console.log('=== BACKEND DEBUGGING ===');
    console.log('Username received:', req.params.username);
    console.log('MovieId received:', req.params.movieId);
    console.log('MovieId type:', typeof req.params.movieId);
    console.log('MovieId length:', req.params.movieId.length);
    console.log('=== END BACKEND DEBUGGING ===');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ ERRORES DE VALIDACIÓN:', errors.array());
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
/**
 * @route DELETE /users/:username/movies/:movieId
 * @summary Remove a movie from a user's favorites
 * @security JWT
 * @param {string} req.params.username - Username
 * @param {string} req.params.movieId - Movie ObjectId
 * @returns {User} 200 - Updated user document
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Error object
 */
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
/**
 * @route DELETE /users/:username
 * @summary Delete (deregister) a user by username
 * @security JWT
 * @param {string} req.params.username - Username
 * @returns {object} 200 - Success message
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Error object
 */
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

/**
 * @route GET /documentation
 * @summary Serve static API documentation page
 * @returns {HTML} 200 - Documentation file
 */
app.get("/documentation", (req, res) => {
  res.sendFile(__dirname + "/public/documentation.html");
});

// Middleware de manejo de errores
/**
 * ADDED: Global error handler for uncaught errors.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong! Please try again later.");
});

// Start server
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
