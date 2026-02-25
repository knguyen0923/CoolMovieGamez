const mongoose = require("mongoose");

//leaderboard schema/model

const newUserSchema = new mongoose.Schema(
  {
    User: {
      type: String,
      required: true,
    },
    game: {
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
  { collection: "Leaderboard" },
);

module.exports = mongoose.model("Leaderboard", newUserSchema);
