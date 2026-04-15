const express = require("express");
const router = express.Router();
const User = require("../../models/userModel");
const UserProfile = require("../../models/UserProfile");
const multer = require("multer");
const bcrypt = require("bcrypt");
const {
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../../config/s3");

const upload = multer({
  storage: multer.memoryStorage()
});

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
    coins,
    coinsDelta,
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

    if (coins !== undefined) {
      const parsedCoins = Number(coins);

      if (Number.isNaN(parsedCoins)) {
        return res.status(400).json({
          message: "coins must be numeric"
        });
      }

      userProfile.coins = Math.max(0, parsedCoins);
    }

    if (coinsDelta !== undefined) {
      const parsedCoinsDelta = Number(coinsDelta);

      if (Number.isNaN(parsedCoinsDelta)) {
        return res.status(400).json({
          message: "coinsDelta must be numeric"
        });
      }

      userProfile.coins = Math.max(0, (userProfile.coins || 0) + parsedCoinsDelta);
    }

    // upload avatar to S3
    if (req.file) {
      // delete old image from S3 if it exists
      if (
        userProfile.avatarUrl &&
        userProfile.avatarUrl.includes("amazonaws.com")
      ) {
        const oldKey = userProfile.avatarUrl.split(".amazonaws.com/")[1];

        if (oldKey) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: oldKey
              })
            );
            console.log("Deleted old avatar:", oldKey);
          } catch (err) {
            console.error("Error deleting old avatar:", err);
          }
        }
      }

      const originalName = req.file.originalname || "avatar";
      const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf("."))
        : "";

      const fileKey = `avatars/${name}-${uuidv4()}${extension}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        })
      );

      userProfile.avatarUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      console.log("Saved avatar to S3:", userProfile.avatarUrl);
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

// SHOP PURCHASE / EQUIP ROUTE
router.put("/:username/shop", upload.none(), async (req, res) => {
  const name = req.params.username;
  const {
    coins,
    usernameStyle,
    avatarBorder,
    profileBorder,
    ownedCosmetics
  } = req.body;

  try {
    let userProfile = await UserProfile.findOne({ username: name });

    if (!userProfile) {
      userProfile = await UserProfile.create({ username: name });
    }

    if (coins !== undefined) {
      userProfile.coins = Number(coins);
    }

    if (usernameStyle !== undefined) {
      userProfile.usernameStyle = usernameStyle;
    }

    if (avatarBorder !== undefined) {
      userProfile.avatarBorder = avatarBorder;
    }

    if (profileBorder !== undefined) {
      userProfile.profileBorder = profileBorder;
    }

    if (ownedCosmetics !== undefined) {
      try {
        const parsed = JSON.parse(ownedCosmetics);

        // only update if valid array
        if (Array.isArray(parsed)) {
          userProfile.ownedCosmetics = parsed;
        }
      } catch (err) {
        console.error("Invalid ownedCosmetics format");
      }
    }

    userProfile.updatedAt = new Date();

    await userProfile.save();

    return res.json({
      message: "Shop item applied",
      profile: userProfile
    });
  } catch (error) {
    console.error("SHOP UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Server error"
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

    // delete avatar from S3 too
    const existingProfile = await UserProfile.findOne({ username: name });

    if (
      existingProfile &&
      existingProfile.avatarUrl &&
      existingProfile.avatarUrl.includes("amazonaws.com")
    ) {
      const oldKey = existingProfile.avatarUrl.split(".amazonaws.com/")[1];

      if (oldKey) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: oldKey
            })
          );
          console.log("Deleted avatar on account delete:", oldKey);
        } catch (err) {
          console.error("Error deleting avatar on account delete:", err);
        }
      }
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