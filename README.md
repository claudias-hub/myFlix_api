# Movie API

This is a RESTful API built with Node.js, Express, and MongoDB for managing a movie database. Users can register, update their profiles, and add or remove favorite movies. All requests are secured with JWT authentication.

## Live Demo
- https://movie-api-w67x.onrender.com

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

## Technologies Used
- Node.js, Express
- MongoDB Atlas, Mongoose
- Passport (JWT strategy)
- bcrypt
- express-validator
- Postman (for testing)
- Render (for deployment)

## Handoff / Setup Manual

- Prerequisites
  - Node.js 18+ and npm
  - MongoDB Atlas (or local MongoDB)

- Environment
  - Create a `.env` file:
    
    MONGODB_URI=<your-connection-string>
    JWT_SECRET=<your-secret>
    PORT=8080
    
  - Ensure the Render environment variables match the above.

- Install & Run (local)
  git clone https://github.com/claudias-hub/myFlix_api.git
  cd myFlix_api
  npm install
  npm start         # or: npm run dev

* API will run on http://localhost:8080/ (or the port you set).

* Documentation
JSDoc output (after generation): ./out/index.html
See “Docs (JSDoc)” below for generation steps once comments are added.

* Testing
Use Postman or curl to verify endpoints.

- Example:
curl http://localhost:8080/movies -H "Authorization: Bearer <token>"

* Known Issues / TODO
Add rate limiting on /login
Add more detailed validation error responses

* Endpoints
Method	Endpoint	Description
POST	/users	    Register a new user
POST	/login   	Login a user and receive JWT
GET	   /movies	    Return list of all movies (auth required)
GET	  /movies/:title	Get details of a specific movie
GET	/genres/:name	Get info about a genre
GET	/directors/:name	Get movies by a specific director
PUT	/users/:username	Update user information
POST	/users/:username/movies/:movieId	Add a movie to favorites
DELETE	/users/:username/movies/:movieId	Remove a movie from favorites
DELETE	/users/:username	Delete a user account


* Getting Started (Locally)
git clone https://github.com/claudias-hub/myFlix_api.git
cd myFlix_api
npm install
npm start

* Docs (JSDoc)
- Install JSDoc:
npm install -g jsdoc
# or as a dev dependency:
# npm i -D jsdoc

- (Optional) Create jsdoc.json to configure include/exclude, source paths, etc.

- Generate:
jsdoc ./ -r
# or:
# jsdoc yourEntryFile.js
Open:
out/index.html