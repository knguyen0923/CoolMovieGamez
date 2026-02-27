const express = require("express");
const app = express();
const cors = require('cors')
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

//HiLo Routes
const hiloCreateRoute = require('./routes/HiloRoutes/HiloCreateRoute')
const hiloGetRoute = require('./routes/HiloRoutes/HiloGetRoute')

//Leaderboard Routes
const leaderboardPostRoute = require('./routes/leaderboardRoutes/leaderboardPost')
const leaderboardGetRoute = require('./routes/leaderboardRoutes/leaderboardGet')
const leaderboardPutRoute = require('./routes/leaderboardRoutes/leaderboardPut')
const leaderboardDeleteRoute = require('./routes/leaderboardRoutes/leaderboardDelete')

//UserProfile Route
const userProfileRoute = require("./routes/userProfileRoute/userProfile")

require('dotenv').config();
const SERVER_PORT = 8081

dbConnection()
app.use(cors({origin: '*'}))
app.use(express.json())
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)

//Guessr routes
app.use('/guessr', guessrCreateRoute)
app.use('/guessr', guessrGetRoute)

//HiLo routes
app.use('/coolmoviegamez/hilo', hiloCreateRoute)
app.use('/coolmoviegamez/hilo', hiloGetRoute)

//Leaderboard routes
app.use('/leaderboard', leaderboardPostRoute)
app.use('/leaderboard', leaderboardGetRoute)
app.use('/leaderboard', leaderboardPutRoute)
app.use('/leaderboard', leaderboardDeleteRoute)

//UserProfile routes
app.use("/api/UserProfile", require("./routes/userProfileRoute/userProfile"));

app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})
