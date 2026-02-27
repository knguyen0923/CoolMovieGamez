const mongoose = require("mongoose");

//leaderboard schema/model

const newUserSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    highscore: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Leaderboards" },
);

module.exports = mongoose.model("Leaderboard", newUserSchema);
