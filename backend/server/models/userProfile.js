const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // link to existing users
  bio: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  coins: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserProfile", userProfileSchema);