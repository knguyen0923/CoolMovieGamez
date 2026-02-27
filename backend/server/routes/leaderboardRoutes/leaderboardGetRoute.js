const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// GET /leaderboard/:game  -> top 10 scores for that game
router.get("/:game", async (req, res) => {
  try {
    const game = req.params.game;

    const leaderboard = await Leaderboard.find({ game })
      .sort({ score: -1, updatedAt: -1 })
      .limit(10);

    return res.json(leaderboard);
  } catch (error) {
    console.error("Could not get leaderboard:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;