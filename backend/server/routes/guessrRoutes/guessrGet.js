const express = require("express");
const router = express.Router();
const guessrScore = require("../../models/guessrModel");

router.get("/user/:username/scores", async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const scores = await guessrScore
      .find({ username })
      .sort({ score: -1 })
      .limit(10);
    return res.json(scores);
  } catch (error) {
    console.error("Could not get scores:", error);
    e;
    return res.status(500).json({
      message: "Failed to fetch user scores",
    });
  }
});

module.exports = router;
