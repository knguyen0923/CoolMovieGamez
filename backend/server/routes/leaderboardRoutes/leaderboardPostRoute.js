const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// POST /leaderboard/:game
router.post("/:game", async (req, res) => {
  try {
    const game = req.params.game;
    const username = req.body.username;
    const score = Number(req.body.score);

    if (!username || Number.isNaN(score)) {
      return res.status(400).json({ message: "username and numeric score are required" });
    }

    const existing = await Leaderboard.findOne({ game, username });

    if (!existing) {
      const newEntry = new Leaderboard({
        game,
        username,
        score,
        updatedAt: new Date(),
      });

      await newEntry.save();
      return res.status(201).json({ message: "Score saved successfully", entry: newEntry });
    }

    // only update if higher
    if (score > existing.score) {
      existing.score = score;
      existing.updatedAt = new Date();
      await existing.save();
      return res.status(200).json({ message: "Score updated successfully", entry: existing });
    }

    return res.status(200).json({ message: "Existing score is higher, not updated", entry: existing });
  } catch (error) {
    console.error("Error saving score on leaderboard:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;