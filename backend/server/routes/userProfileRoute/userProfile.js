const express = require("express");
const router = express.Router();
const User = require("../../models/userModel");
const UserProfile = require("../../models/UserProfile");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

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

// UPDATE user profile + optional password change
router.put("/:username", upload.single("avatar"), async (req, res) => {
  const name = req.params.username;
  const {
    firstName,
    lastName,
    email,
    bio,
    currentPassword,
    newPassword
  } = req.body;

  console.log("----- PROFILE UPDATE REQUEST -----");
  console.log("Username:", name);
  console.log("First Name:", firstName);
  console.log("Last Name:", lastName);
  console.log("Email:", email);
  console.log("Bio:", bio);
  console.log("Current Password Provided:", !!currentPassword);
  console.log("New Password Provided:", !!newPassword);
  console.log("File received:", req.file);

  try {
    const foundUser = await User.findOne({ username: name });

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let userProfile = await UserProfile.findOne({ username: name });

    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }

    // update main user info
    if (firstName !== undefined) {
      foundUser.firstName = firstName;
    }

    if (lastName !== undefined) {
      foundUser.lastName = lastName;
    }

    if (email !== undefined) {
      foundUser.email = email;
    }

    // password change logic
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({
        message: "Both current and new password must be entered"
      });
    }

    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(
        currentPassword,
        foundUser.password
      );

      if (!validPassword) {
        return res.status(400).json({
          message: "Current password is incorrect"
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      foundUser.password = hashedPassword;

      console.log("Password updated for user:", name);
    }

    await foundUser.save();

    // update profile info
    if (bio !== undefined) {
      userProfile.bio = bio;
    }

    // save uploaded avatar path if file was uploaded
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
      user: await User.findOne({ username: name }).select("-password"),
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