require('dotenv').config();

const express = require("express");
const app = express();
const cors = require('cors');
const path = require("path");


// USER ROUTES
const loginRoute = require('./routes/userRoutes/userLogin');
const getAllUsersRoute = require('./routes/userRoutes/userGetAllUsers');
const registerRoute = require('./routes/userRoutes/userSignUp');
const getUserByIdRoute = require('./routes/userRoutes/userGetUserById');
const editUser = require('./routes/userRoutes/userEditUser');
const deleteUser = require('./routes/userRoutes/userDeleteAll');

// DB CONNECTION
const dbConnection = require('./config/db.config');

// GUESSR ROUTES
const guessrCreateRoute = require('./routes/guessrRoutes/guessrCreate');
const guessrGetRoute = require('./routes/guessrRoutes/guessrGet');
const guessrPlay = require('./routes/guessrRoutes/guessrPlay');
const guessrGetLeaderboard = require('./routes/guessrRoutes/guessrGetLeaderboard');

// HILO ROUTES
const hiloCreateRoute = require('./routes/HiloRoutes/HiloCreateRoute');
const hiloGetRoute = require('./routes/HiloRoutes/HiloGetRoute');
const hiloMoviesRoute = require('./routes/HiloRoutes/HiloMovies');

// LEADERBOARD ROUTES
const leaderboardPostRoute = require('./routes/leaderboardRoutes/leaderboardPostRoute');
const leaderboardGetRoute = require('./routes/leaderboardRoutes/leaderboardGetRoute');
const leaderboardPutRoute = require('./routes/leaderboardRoutes/leaderboardPutRoute');
const leaderboardDeleteRoute = require('./routes/leaderboardRoutes/leaderboardDeleteRoute');

// USER PROFILE
const userProfileRoute = require("./routes/userProfileRoute/userProfile");

// API DATA ROUTES
const apiCreateData = require('./routes/apiRoutes/apiCreateData');
const apiGet = require('./routes/apiRoutes/apiGet');
const apiDeleteAll = require('./routes/apiRoutes/apiDeleteAll');

// BASIC TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// CONFIG
const SERVER_PORT = process.env.PORT || 8081;

// Connect DB
dbConnection();

app.use(cors({
  origin: "https://cool-movie-gamez.vercel.app",
  credentials: true
}));

// BODY PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//STANDARDIZE ALL ROUTES TO /api

app.use('/api/users', loginRoute);
app.use('/api/users', registerRoute);
app.use('/api/users', getAllUsersRoute);
app.use('/api/users', getUserByIdRoute);
app.use('/api/users', editUser);
app.use('/api/users', deleteUser);

// GUESSR
app.use('/api/guessr', guessrCreateRoute);
app.use('/api/guessr', guessrGetRoute);
app.use('/api/guessr', guessrGetLeaderboard);
app.use('/api/guessr', guessrPlay);

// HILO
app.use('/api/hilo', hiloCreateRoute);
app.use('/api/hilo', hiloGetRoute);
app.use('/api/hilo', hiloMoviesRoute);

// LEADERBOARD
app.use('/api/leaderboard', leaderboardPostRoute);
app.use('/api/leaderboard', leaderboardGetRoute);
app.use('/api/leaderboard', leaderboardPutRoute);
app.use('/api/leaderboard', leaderboardDeleteRoute);

// USER PROFILE 
app.use("/api/userProfile", userProfileRoute);

// API DATA
app.use('/api/data', apiCreateData);
app.use('/api/data', apiGet);
app.use('/api/data', apiDeleteAll);

// =========================
// START SERVER
// =========================
app.listen(SERVER_PORT, () => {
  console.log(`🚀 Backend running on port ${SERVER_PORT}`);
});