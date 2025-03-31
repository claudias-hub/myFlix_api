const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require('mongoose');

const { Movie, User } = require("./models"); 

const mongoURI = 'mongodb://127.0.0.1:27017/movieDB';  
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));


const app = express();
const port = 8080; // Change if needed

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files /documentation will work automatically
app.use(morgan("common")); // "common" muestra logs básicos


// Homepage
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});
 
// GET All Movies (from MongoDB)
app.get("/movies", async (req, res) => {
    try {
        const movies = await Movie.find(); // Get all movies from MongoDB
        res.json(movies);
    } catch (error) {
        res.status(500).send("Error retrieving movies.");
    }
});

// GET a single movie by title
app.get("/movies/:title", async (req, res) => {
    try {
        const movie = await Movie.findOne({ title: req.params.title }); // Find movie by title
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send("Movie not found.");
        }
    } catch (error) {
        res.status(500).send("Error retrieving movie.");
    }
});


//  Get genre details by name
app.get("/genres/:name", (req, res) => {
    const moviesByGenre = topMovies.filter(m => m.genre.toLowerCase() === req.params.name.toLowerCase());
    if (moviesByGenre.length > 0) {
        res.json({ genre: req.params.name, movies: moviesByGenre });
    } else {
        res.status(404).send("Genre not found.");
    }
});


//  Get director details by name
app.get("/directors/:name", (req, res) => {
    const moviesByDirector = topMovies.filter(m => m.director.toLowerCase() === req.params.name.toLowerCase());
    if (moviesByDirector.length > 0) {
        res.json({ director: req.params.name, movies: moviesByDirector });
    } else {
        res.status(404).send("Director not found.");
    }
});


// Register a new user
app.post("/users", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const newUser = new User({ username, email, password });
        await newUser.save(); // Save new user to MongoDB
        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        res.status(500).send("Error registering user.");
    }
});


// Update user info
app.put("/users/:username", async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: req.body },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: `User ${req.params.username} has been updated.`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user." });
    }
});


// Add a movie to user's favorite list
app.post("/users/:username/movies/:movieID", async (req, res) => {
    const { username, movieID } = req.params;

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the movie
        const movie = await Movie.findOne({ title: movieID });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Add movie to user's favorites if it's not already in the list
        if (!user.favorites.includes(movie.title)) {
            user.favorites.push(movie.title);
            await user.save(); // Save the updated user
            return res.json({ message: `Movie "${movie.title}" added to ${username}'s favorites.` });
        } else {
            return res.json({ message: `Movie "${movie.title}" is already in ${username}'s favorites.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error adding movie to favorites." });
    }
});


// Remove a movie from user’s favorite list
app.delete("/users/:username/movies/:movieID", async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { $pull: { favorites: req.params.movieID } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or movie not in favorites." });
        }

        res.json({ message: `Movie "${req.params.movieID}" removed from ${req.params.username}'s favorites.` });
    } catch (error) {
        res.status(500).json({ message: "Error removing movie from favorites." });
    }
});



// Deregister a user
app.delete("/users/:username", async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ username: req.params.username });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: `User ${req.params.username} has been removed.` });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user." });
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