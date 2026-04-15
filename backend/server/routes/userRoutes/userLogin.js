const express = require("express");
const router = express.Router();
const z = require("zod");
const { userLoginValidation } = require("../../models/userValidator");
const newUserModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../../utilities/generateToken");

router.post("/login", async (req, res) => {
  const { error } = userLoginValidation(req.body);
  if (error) return res.status(400).send({ message: error.errors[0].message });

  const { username, password } = req.body;

  const user = await newUserModel.findOne({
    $or: [{ username: username }, { email: username }],
  });

  // checks if the user exists
  if (!user)
    return res
      .status(401)
      .send({ message: "username/email or password does not exist, try again" });

  // check if the password is correct or not
  const checkPasswordValidity = await bcrypt.compare(password, user.password);

  if (!checkPasswordValidity)
    return res
      .status(401)
      .send({ message: "username/email or password does not exist, try again" });

  // hard coded admin role for admin for testing
  const role = user.email === "Adminmain@test.com" ? "admin" : user.role;
  // create json web token
  const accessToken = generateAccessToken(
    user._id,
    user.email,
    user.username,
    user.firstName,
    user.lastName,
    role
  );

  res.header("Authorization", accessToken).send({ accessToken: accessToken });
});

module.exports = router;