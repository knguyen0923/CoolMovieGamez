const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateAccessToken = (userId, email, username, firstName, lastName) => {
  return jwt.sign(
    { id: userId, email, username, firstName, lastName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports.generateAccessToken = generateAccessToken;