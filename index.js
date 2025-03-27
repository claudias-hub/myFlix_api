const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const port = 8080; // Change if needed

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files /documentation will work automatically
app.use(morgan("common")); // "common" muestra logs básicos

let users = [
    { username: "john_doe", 
      email: "john@example.com", 
      favorites: [],
      password: "secure123" 
    },
    { username: "jane_doe", 
      email: "jane@example.com", 
      favorites: [],
      password: "secure231" 
    },
    { username: "claudia_doe", 
      email: "claudia@example.com", 
      favorites: [],
      password: "secure231" 
      },
];
let topMovies = [
    {
        title: "The Shawshank Redemption",
        director: "Frank Darabont",
        genre: "Drama",
        year: 1994,
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    },
    {
        title: "Inception",
        director: "Christopher Nolan",
        genre: "Science Fiction",
        year: 2010,
        description: "A thief who enters the dreams of others to steal their secrets must plant an idea in someone's mind to succeed in his toughest mission."
    },
    {
        title: "The Godfather",
        director: "Francis Ford Coppola",
        genre: "Crime",
        year: 1972,
        description: "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son."
    },
    {
        title: "The Dark Knight",
        director: "Christopher Nolan",
        genre: "Action",
        year: 2008,
        description: "Batman sets out to dismantle the remaining criminal organizations in Gotham, but a new villain known as the Joker emerges."
    },
    {
        title: "Forrest Gump",
        director: "Robert Zemeckis",
        genre: "Drama",
        year: 1994,
        description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold through the perspective of a slow-witted but kind-hearted man."
    },
    {
        title: "Pulp Fiction",
        director: "Quentin Tarantino",
        genre: "Crime",
        year: 1994,
        description: "The lives of two hitmen, a boxer, a gangster, and his wife intertwine in a series of bizarre and violent incidents."
    },
    {
        title: "Interstellar",
        director: "Christopher Nolan",
        genre: "Science Fiction",
        year: 2014,
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
        title: "The Matrix",
        director: "Lana Wachowski, Lilly Wachowski",
        genre: "Science Fiction",
        year: 1999,
        description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers."
    },
    {
        title: "The Lord of the Rings: The Return of the King",
        director: "Peter Jackson",
        genre: "Fantasy",
        year: 2003,
        description: "Gandalf and Aragorn lead the World of Men against Sauron's army to distract him from Frodo and Sam's journey to Mount Doom."
    },
    {
        title: "Titanic",
        director: "James Cameron",
        genre: "Romance",
        year: 1997,
        description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic."
    }
  ];

// Homepage
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});
 
// Other Routes
app.get("/movies", (req, res) => {
    res.json(topMovies);
});

//  Get a single movie by title
app.get("/movies/:title", (req, res) => {
    const movie = topMovies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send("Movie not found.");
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


//  Register a new user--------------POSTMAN
app.post("/users", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    const newUser = { username, email, password };
    users.push(newUser); // Simula guardar en una BD

    res.status(201).json({ message: "User registered successfully!", user: newUser });
});

// Update user info
app.put("/users/:username", (req, res) => {
    const { username } = req.params;
    const { email, password } = req.body;

    let user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).send("User not found.");
    }

    // Actualizar datos
    if (email) user.email = email;
    if (password) user.password = password;

    res.json({ message: `User ${username} has been updated.`, user });
});

//  Add a movie to user’s favorite list
app.post("/users/:username/movies/:movieID", (req, res) => {
    const { username, movieID } = req.params;
    
    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if movie exists in topMovies
    const movie = topMovies.find(m => m.title.toLowerCase().replace(/\s+/g, '') === movieID.toLowerCase());
    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }

    // Add movie to user's favorites
    if (!user.favorites.includes(movie.title)) {
        user.favorites.push(movie.title);
        return res.json({ message: `Movie "${movie.title}" added to ${username}'s favorites.` });
    } else {
        return res.json({ message: `Movie "${movie.title}" is already in ${username}'s favorites.` });
    }
});

// Remove a movie from user’s favorite list
app.delete("/users/:username/movies/:movieID", (req, res) => {
    const { username, movieID } = req.params;

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if movie is in favorites
    const movieIndex = user.favorites.indexOf(movieID);
    if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found in favorites." });
    }

    // Remove movie from favorites
    user.favorites.splice(movieIndex, 1);
    return res.json({ message: `Movie "${movieID}" removed from ${username}'s favorites.` });
});


// Deregister a user
app.delete("/users/:username", (req, res) => {
    res.send(`User ${req.params.username} has been removed.`);
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