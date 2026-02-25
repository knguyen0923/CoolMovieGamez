const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboardModel");

// DELETE
router.delete("/", async (req, res) => {
  await Leaderboard.deleteMany();
  res.json({ message: "Leaderboard cleared" });
});

module.exports = router;