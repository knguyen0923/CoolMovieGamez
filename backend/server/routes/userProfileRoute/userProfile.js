// routes/userProfileRoute/userProfile.js
const express = require("express");
const router = express.Router();

const User = require("../../models/userModel");
const UserProfile = require("../../models/userProfile");

// GET UserProfile
router.get("/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await UserProfile.findOne({ username });

    // Create profile automatically if it doesn't exist
    if (!profile) profile = await UserProfile.create({ username });

    return res.json({ user, profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update UserProfile
router.put("/:username", async (req, res) => {
  const username = req.params.username;
  const { bio, avatarUrl, coins } = req.body;

  try {
    let profile = await UserProfile.findOne({ username });
    if (!profile) profile = await UserProfile.create({ username });

    if (bio !== undefined) profile.bio = bio;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

    if (coins !== undefined) {
      const numCoins = Number(coins);
      if (Number.isNaN(numCoins)) {
        return res.status(400).json({ message: "coins must be a number" });
      }
      profile.coins = numCoins;
    }

    profile.updatedAt = new Date();
    await profile.save();

    return res.json({ message: "UserProfile updated", profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;