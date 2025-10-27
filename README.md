# Movie API

This is a RESTful API built with Node.js, Express, and MongoDB for managing a movie database. Users can register, update their profiles, and add or remove favorite movies. All requests are secured with JWT authentication.

## Live Demo
- https://movie-api-w67x.onrender.com

## Features
- User registration and profile update
- Password hashing with bcrypt
- JWT-based login and authentication
- CORS enabled
- MongoDB Atlas integration
- Data validation using express-validator
- Favorite movie management
- RESTful endpoints for movies, genres, and directors

## Technologies Used
- Node.js, Express
- MongoDB Atlas, Mongoose
- Passport (JWT strategy)
- bcrypt
- express-validator
- Postman (for testing)
- Render (for deployment)

## Handoff / Setup Manual

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas (or local MongoDB)

### Environment
Create a `.env` file:

```bash
MONGO_URI=<your-connection-string>
JWT_SECRET=<your-secret>
PORT=8080
```

Ensure the Render environment variables match the above.

## Install & Run (local)

```bash
git clone https://github.com/claudias-hub/myFlix_api.git
cd myFlix_api
npm install
npm start    # or: npm run dev
```

API will run on http://localhost:8080/ (or the port you set).

## Documentation
JSDoc output (after generation): ./out/index.html
GitHub Pages: https://claudias-hub.github.io/myFlix_api/

### Generate docs:

```bash
npm run docs
# then open:
docs/index.html
```

### Testing
Use Postman or curl to verify endpoints:

```bash
curl http://localhost:8080/movies -H "Authorization: Bearer <token>"
```

## Endpoints (fetch-api-data.ts):
### Public:
- POST /users — userRegistration(userDetails)
- POST /login — userLogin(userDetails)
### Protected (send Authorization: Bearer <token>):
- GET /movies — getAllMovies()
- GET /movies/:title — getMovieByTitle(title)
- GET /genres/:name — getGenreByName(name)
- GET /directors/:name — getDirectorByName(name)
- GET /users/:username — getUser(username)
- PUT /users/:username — editUser(username, updateData)
- GET /users/:username/movies — getFavoriteMovies(username)
- POST /users/:username/movies/:movieId — addFavoriteMovie(username, movieId) - Add a movie to favorites
- DELETE /users/:username/movies/:movieId — removeFavoriteMovie(username, movieId) - Remove a movie from favorites
- DELETE /users/:username — deleteUser(username)

## Known Issues / TODO
Add rate limiting on /login
Add more detailed validation error responses

## AI Use Declaration
Parts of this project’s documentation and code comments were drafted with assistance from an AI assistant (Abacus.AI ChatLLM Teams).


