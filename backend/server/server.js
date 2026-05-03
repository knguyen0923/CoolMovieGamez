require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

// USER ROUTES
const loginRoute = require("./routes/userRoutes/userLogin");
const getAllUsersRoute = require("./routes/userRoutes/userGetAllUsers");
const registerRoute = require("./routes/userRoutes/userSignUp");
const getUserByIdRoute = require("./routes/userRoutes/userGetUserById");
const editUser = require("./routes/userRoutes/userEditUser");
const deleteUser = require("./routes/userRoutes/userDeleteAll");

// DB CONNECTION
const dbConnection = require("./config/db.config");

// GUESSR ROUTES
const guessrCreateRoute = require("./routes/guessrRoutes/guessrCreate");
const guessrGetRoute = require("./routes/guessrRoutes/guessrGet");
const guessrPlay = require("./routes/guessrRoutes/guessrPlay");
const guessrGetLeaderboard = require("./routes/guessrRoutes/guessrGetLeaderboard");

// HILO ROUTES
const hiloCreateRoute = require("./routes/HiloRoutes/HiloCreateRoute");
const hiloGetRoute = require("./routes/HiloRoutes/HiloGetRoute");
const hiloMoviesRoute = require("./routes/HiloRoutes/HiloMovies");

// LEADERBOARD ROUTES
const leaderboardPostRoute = require("./routes/leaderboardRoutes/leaderboardPostRoute");
const leaderboardGetRoute = require("./routes/leaderboardRoutes/leaderboardGetRoute");
const leaderboardPutRoute = require("./routes/leaderboardRoutes/leaderboardPutRoute");
const leaderboardDeleteRoute = require("./routes/leaderboardRoutes/leaderboardDeleteRoute");

// USER PROFILE
const userProfileRoute = require("./routes/userProfileRoute/userProfile");

// API DATA ROUTES
const apiCreateData = require("./routes/apiRoutes/apiCreateData");
const apiGet = require("./routes/apiRoutes/apiGet");
const apiDeleteAll = require("./routes/apiRoutes/apiDeleteAll");

// CONFIG
const SERVER_PORT = process.env.PORT || 8081;

// CONNECT DB
dbConnection();

// Manual CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (origin.includes("vercel.app") || origin.includes("localhost"))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// BODY PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BASIC TEST ROUTES
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API test route working" });
});

// STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// USER ROUTES
app.use("/api/users", loginRoute);
app.use("/api/users", registerRoute);
app.use("/api/users", getAllUsersRoute);
app.use("/api/users", getUserByIdRoute);
app.use("/api/users", editUser);
app.use("/api/users", deleteUser);

// GUESSR ROUTES
app.use("/api/guessr", guessrCreateRoute);
app.use("/api/guessr", guessrGetRoute);
app.use("/api/guessr", guessrGetLeaderboard);
app.use("/api/guessr", guessrPlay);

// HILO ROUTES
app.use("/api/hilo", hiloCreateRoute);
app.use("/api/hilo", hiloGetRoute);
app.use("/api/hilo", hiloMoviesRoute);

// LEADERBOARD ROUTES
app.use("/api/leaderboard", leaderboardPostRoute);
app.use("/api/leaderboard", leaderboardGetRoute);
app.use("/api/leaderboard", leaderboardPutRoute);
app.use("/api/leaderboard", leaderboardDeleteRoute);

// USER PROFILE ROUTES
app.use("/api/userProfile", userProfileRoute);

// API DATA ROUTES
app.use("/api/data", apiCreateData);
app.use("/api/data", apiGet);
app.use("/api/data", apiDeleteAll);

// START SERVER
app.listen(SERVER_PORT, () => {
  console.log(`🚀 Backend running on port ${SERVER_PORT}`);
});