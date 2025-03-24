const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const port = 8080; // Change if needed

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files /documentation will work automatically
app.use(morgan("common")); // "common" muestra logs básicos


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