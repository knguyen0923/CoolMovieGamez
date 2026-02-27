const express = require("express");
const router = express.Router();
const Leaderboard = require("../../models/leaderboardModel");

// DELETE /leaderboard  (because server.js mounts '/leaderboard')
router.delete("/", async (req, res) => {
  try {
    const result = await Leaderboard.deleteMany({});
    return res.status(200).json({
      message: "Leaderboard cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;