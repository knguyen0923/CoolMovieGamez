const mongoose = require("mongoose");

// Schema to store extra profile info for each user

const profileDataSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true
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

  ownedCosmetics: {
  type: [String],
  default: []
},

  usernameStyle: {
    type: String,
    default: ""
  },

  avatarBorder: {
    type: String,
    default: ""
  },

  profileBorder: {
    type: String,
    default: ""
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

});

module.exports = mongoose.model("UserProfile", profileDataSchema);