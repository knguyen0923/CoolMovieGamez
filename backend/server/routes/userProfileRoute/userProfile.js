// routes/userProfileRoute.js

const express = require("express");

const router = express.Router();

const User = require("../../models/userModel");
const UserProfile = require("../../models/UserProfile");

// GET user profile info

router.get("/:username", async (req, res) => {

  const name = req.params.username;

  try {

    const foundUser = await User
      .findOne({ username: name })
      .select("-password");

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    let userProfile = await UserProfile.findOne({ username: name });


    // If no profile exists yet, create one
    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }

    return res.json({
      user: foundUser,
      profile: userProfile
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });

  }

});

// UPDATE user profile

router.put("/:username", async (req, res) => {

  const name = req.params.username;

  const bioText = req.body.bio;
  const avatarLink = req.body.avatarUrl;
  const coinAmount = req.body.coins;

  try {

    let userProfile = await UserProfile.findOne({ username: name });

    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }


    // Update fields only if values were sent

    if (bioText !== undefined) {
      userProfile.bio = bioText;
    }

    if (avatarLink !== undefined) {
      userProfile.avatarUrl = avatarLink;
    }

    if (coinAmount !== undefined) {
      userProfile.coins = Number(coinAmount);
    }

    userProfile.updatedAt = new Date();

    await userProfile.save();


    return res.json({
      message: "UserProfile updated",
      profile: userProfile
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;