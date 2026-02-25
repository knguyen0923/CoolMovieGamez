const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboardModel");

// POST
router.post("/", async (req, res) => {const entry = await Leaderboard.create(req.body);
    res.status(201).json(entry);
});

module.exports = router;