const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboardModel");

// PUT
router.put("/:game/:user", async (req, res) => {
  const updated = await Leaderboard.findOneAndUpdate(
    { user: req.params.user, game: req.params.game },
    { highscore: req.body.highscore },
    { new: true }
  );
  res.json(updated);
});


module.exports = router;