const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000; // Change if needed

app.use(bodyParser.json());

// Sample route
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
