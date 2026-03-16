const express = require("express");
const router = express.Router();
const User = require("../../models/userModel");
const UserProfile = require("../../models/UserProfile");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// make sure uploads folder exists
const uploadFolder = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// GET user profile info
router.get("/:username", async (req, res) => {
  const name = req.params.username;

  try {
    const foundUser = await User.findOne({ username: name }).select("-password");

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let userProfile = await UserProfile.findOne({ username: name });

    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }

    return res.json({
      user: foundUser,
      profile: userProfile
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
});

// UPDATE user profile
router.put("/:username", upload.single("avatar"), async (req, res) => {
  const name = req.params.username;
  const bioText = req.body.bio;

  console.log("----- PROFILE UPDATE REQUEST -----");
  console.log("Username:", name);
  console.log("Bio:", bioText);
  console.log("File received:", req.file);

  try {
    let userProfile = await UserProfile.findOne({ username: name });

    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }

    if (bioText !== undefined) {
      userProfile.bio = bioText;
    }

    // save uploaded avatar path
    if (req.file) {
      console.log("Saving avatar file:", req.file.filename);
      userProfile.avatarUrl = `/uploads/${req.file.filename}`;
    } else {
      console.log("No file received by multer");
    }

    userProfile.updatedAt = new Date();

    await userProfile.save();

    return res.json({
      message: "UserProfile updated",
      profile: userProfile
    });

  } catch (error) {
    console.error("PUT PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

// DELETE entire user account
router.delete("/account/:username", async (req, res) => {
  const name = req.params.username;

  try {
    const removedUser = await User.findOneAndDelete({ username: name });

    if (!removedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await UserProfile.findOneAndDelete({ username: name });

    return res.json({
      message: "User account and profile deleted"
    });

  } catch (error) {
    console.error("DELETE PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;