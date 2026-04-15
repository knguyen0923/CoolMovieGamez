const express = require("express");
const app = express();
const cors = require('cors')
const path = require("path");
const loginRoute = require('./routes/userRoutes/userLogin')
const getAllUsersRoute = require('./routes/userRoutes/userGetAllUsers')
const registerRoute = require('./routes/userRoutes/userSignUp')
const getUserByIdRoute = require('./routes/userRoutes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userRoutes/userEditUser')
const deleteUser = require('./routes/userRoutes/userDeleteAll')

//Guessr Routes
const guessrCreateRoute = require('./routes/guessrRoutes/guessrCreate')
const guessrGetRoute = require('./routes/guessrRoutes/guessrGet')
const guessrPlay = require('./routes/guessrRoutes/guessrPlay')

//HiLo Routes
const hiloCreateRoute = require('./routes/HiloRoutes/HiloCreateRoute')
const hiloGetRoute = require('./routes/HiloRoutes/HiloGetRoute')
const guessrGetLeaderboard = require('./routes/guessrRoutes/guessrGetLeaderboard')

//Leaderboard Routes
const leaderboardPostRoute = require('./routes/leaderboardRoutes/leaderboardPostRoute')
const leaderboardGetRoute = require('./routes/leaderboardRoutes/leaderboardGetRoute')
const leaderboardPutRoute = require('./routes/leaderboardRoutes/leaderboardPutRoute')
const leaderboardDeleteRoute = require('./routes/leaderboardRoutes/leaderboardDeleteRoute')

//UserProfile Route
const userProfileRoute = require("./routes/userProfileRoute/userProfile");

//api routes
const apiCreateData = require('./routes/apiRoutes/apiCreateData')
const apiGet = require('./routes/apiRoutes/apiGet')
const apiDeleteAll = require('./routes/apiRoutes/apiDeleteAll')

require('dotenv').config();
const SERVER_PORT = 8081
dbConnection()
app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// lets frontend load uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/users', loginRoute)
app.use('/users', registerRoute)
app.use('/users', getAllUsersRoute)
app.use('/users', getUserByIdRoute)
app.use('/users', editUser)
app.use('/users', deleteUser)

//Guessr routes
app.use('/guessr', guessrCreateRoute)
app.use('/guessr', guessrGetRoute)
app.use('/guessr', guessrGetLeaderboard)
app.use('/guessr', guessrPlay)

//HiLo routes
app.use('/coolmoviegamez/hilo', hiloCreateRoute)
app.use('/coolmoviegamez/hilo', hiloGetRoute)

//Leaderboard routes
app.use('/leaderboard', leaderboardPostRoute)
app.use('/leaderboard', leaderboardGetRoute)
app.use('/leaderboard', leaderboardPutRoute)
app.use('/leaderboard', leaderboardDeleteRoute)

//UserProfile routes
app.use("/api/userProfile", userProfileRoute);

//imdbapi.dev route
app.use('/api', apiCreateData);
app.use('/api', apiGet);
app.use('/api', apiDeleteAll);


app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})