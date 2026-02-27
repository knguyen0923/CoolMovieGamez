const mongoose = require("mongoose");

// Schema to store extra profile info for each user

const profileDataSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true      // connects profile to a user account
  },

  bio: {
    type: String,
    default: ""
  },

  avatarUrl: {
    type: String,
    default: ""
  },

  coins: {
    type: Number,
    default: 0
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

});

// Export the model so routes can use it

module.exports = mongoose.model("UserProfile", profileDataSchema);