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

app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})
