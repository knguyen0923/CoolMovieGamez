const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// GET /leaderboard/:game
router.get("/:game", async (req, res) => {
  console.log("Leaderboard GET route hit");

  try {
    const game = req.params.game.toLowerCase().trim();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaderboard = await Leaderboard.find({
      game,
      updatedAt: { $gte: today },
    })
      .sort({ score: -1, updatedAt: -1 })
      .limit(10);

    return res.json(leaderboard);
  } catch (error) {
    console.error("Could not get leaderboard:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;