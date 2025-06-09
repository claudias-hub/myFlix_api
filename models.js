const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Override toJSON to remove password from API responses and JWTs
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // 🔐 removes password before sending or signing
  return obj;
};

// Create Models
let Movie = mongoose.model('Movie', movieSchema, 'movies');
let User = mongoose.model('User', userSchema);

// Export Models
module.exports = { Movie, User };
