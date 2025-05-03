# Movie API

This is a RESTful API built with Node.js, Express, and MongoDB for managing a movie database. Users can register, update their profiles, and add or remove favorite movies. All requests are secured with JWT authentication.

## Live Demo

🔗 [Live API on Render](https://movie-api-w67x.onrender.com)  
🌐 Replace the link above with your actual Render link

---

## Features

- User registration and profile update
- Password hashing with bcrypt
- JWT-based login and authentication
- CORS enabled
- MongoDB Atlas integration
- Data validation using express-validator
- Favorite movie management
- RESTful endpoints for movies, genres, and directors

---

## Technologies Used

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Passport (JWT strategy)
- bcrypt
- express-validator
- Postman (for testing)
- Render (for deployment)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Register a new user |
| `POST` | `/login` | Login a user and receive JWT |
| `GET` | `/movies` | Return list of all movies (auth required) |
| `GET` | `/movies/:title` | Get details of a specific movie |
| `GET` | `/genres/:name` | Get info about a genre |
| `GET` | `/directors/:name` | Get movies by a specific director |
| `PUT` | `/users/:username` | Update user information |
| `POST` | `/users/:username/movies/:movieId` | Add a movie to favorites |
| `DELETE` | `/users/:username/movies/:movieId` | Remove a movie from favorites |
| `DELETE` | `/users/:username` | Delete a user account |

---

## Getting Started (Locally)

1. Clone this repo:
```bash
git clone https://github.com/yourusername/movie_api.git
cd movie_api
