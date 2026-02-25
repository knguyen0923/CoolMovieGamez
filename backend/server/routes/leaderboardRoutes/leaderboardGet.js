const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboardModel");

// GET
router.get("/", async (req, res) => {const leaderboard = await Leaderboard.find().sort({ highscore: -1 });
res.json(leaderboard);
});

module.exports = router;