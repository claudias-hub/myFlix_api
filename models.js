const mongoose = require("mongoose");

// Movie Schema
let movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
    birthYear: Number,
    deathYear: Number,
  },
  imageURL: String,
  featured: Boolean,
});

// User Schema
let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

// Create Models
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// Export Models
module.exports = { Movie, User };
