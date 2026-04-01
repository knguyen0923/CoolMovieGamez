const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { newUserValidation } = require("../../models/userValidator");
const newUserModel = require("../../models/userModel");

router.post("/signup", async (req, res) => {
  const result = newUserValidation(req.body);

  if (!result.success) {
    return res.status(400).send({
      message: result.error.issues[0].message
    });
  }

  const { username, email, firstName, lastName, password } = req.body;

  const existingUsername = await newUserModel.findOne({ username: username });
  if (existingUsername) {
    return res.status(409).send({ message: "Username is taken, pick another" });
  }

  const existingEmail = await newUserModel.findOne({ email: email });
  if (existingEmail) {
    return res.status(409).send({ message: "Email is already in use" });
  }

  const generateHash = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, generateHash);

  const createUser = new newUserModel({
    username: username,
    email: email,
    firstName: firstName,
    lastName: lastName,
    password: hashPassword,
  });

  try {
    const saveNewUser = await createUser.save();
    res.send(saveNewUser);
  } catch (error) {
    res.status(400).send({ message: "Error trying to create new user" });
  }
});

module.exports = router;