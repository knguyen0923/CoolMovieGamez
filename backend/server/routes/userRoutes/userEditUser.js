const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");
const newUserModel = require("../../models/userModel");
const { newUserValidation } = require("../../models/userValidator");
const { generateAccessToken } = require("../../utilities/generateToken");

router.put("/:id", async (req, res) => {
  try{
    const userId = req.params.id;

    //validate input
    const result = newUserValidation(req.body);
    if(!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }
    const { username, email, firstName, lastName, password } = req.body;

    // check username uniqueness
    const existingUser = await newUserModel.findOne({ username});
    if(existingUser && existingUser._id.toString() !== userId) {
      return res.status(409).json({ message: "Username is taken, pick another" });
    }

    // build update object
    const updateData = { username, email, firstName, lastName };

    // only hash password if provided
    if(password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // add role support
    if(req.body.role) {
      updateData.role = req.body.role;
    }

    // update user
    const updatedUser = await newUserModel.findByIdAndUpdate(
      userId,updateData, { new: true }  
    );

    if(!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate new token with updated info
    const accessToken = generateAccessToken(
      updatedUser._id,
      updatedUser.email,
      updatedUser.username,
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.role
    );
    return res.header("Authorization", accessToken).json({ accessToken });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;