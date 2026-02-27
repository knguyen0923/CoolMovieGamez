const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// DELETE
router.delete("/leaderboard/", async (req, res) => {
  try{
    await Leaderboard.deleteMany({});
    res.status(200).json({ message: "Leaderboard cleared successfully" });
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;