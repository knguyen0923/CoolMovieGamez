const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    game: { 
      type: String,
      required: true, 
      trim: true
    },
    username: { 
      type: String, 
      required: true, 
      trim: true },
    score: { 
      type: Number, 
      required: true, 
      min: 0 },
    updatedAt: { 
      type: Date,
      default: Date.now },
  },
  { collection: "Leaderboards" }
);

// Only one possible highscore per user per game
leaderboardSchema.index({ game: 1, username: 1 }, { unique: true });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);