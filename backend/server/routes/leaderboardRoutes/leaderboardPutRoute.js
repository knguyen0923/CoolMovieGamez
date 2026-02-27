const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// PUT
router.put("/leaderboard/:game/", async (req, res) => {
    const game = req.params.game;
    const username = req.body.username;
    const score = req.body.score;
    
    try {
        const existingEntry = await Leader
          board.findOne({ game: game, username: username });
        if (existingEntry) {
          if (score > existingEntry.score) {
            existingEntry.score = score;
            await existingEntry.save();
            res.json({ message: "Score updated successfully" });
          } else {
            res.json({ message: "Existing score is higher, not updated" });
          }
        } else {
          const newEntry = new Leaderboard({
            game: game,
            username: username,
            score: score
          });
          await newEntry.save();
          res.status(201).json({ message: "Score saved successfully" });
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        res.status(500).json({ error: error.message });
    }  
});


module.exports = router;