const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboardModel");

// GET
router.get("/leaderboard/:game/", async (req, res) => {
    const game = req.params.game;
    try{
        const leaderboard = await Leaderboard.find({ game: game }).sort({ score: -1 }).limit(10);
        res.json(leaderboard);
    } catch (error) {
        console.error('Could not get leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;