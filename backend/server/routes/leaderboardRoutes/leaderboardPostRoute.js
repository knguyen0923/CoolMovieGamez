const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// POST
router.post("/leaderboard/", async (req, res) => {
    const game = req.body.game;
    const username = req.body.username;
    const score = req.body.score;

    try{
        const newEntry = new Leaderboard({
            game: game,
            username: username,
            score: score
        });

        await newEntry.save();
        res.status(201).json({ message: "Score saved successfully" });
        
    } catch (error) {
        console.error('Error saving score on leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
}); 

module.exports = router;