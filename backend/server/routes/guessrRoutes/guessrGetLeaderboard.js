const express = require("express");
const router = express.Router();
const guessrScore = require("../../models/guessrModel");

router.get("/scores", async (req, res) => {
  const game = "guessr";

  try {
    const scores = await guessrScore
      .find({ game })
      .sort({ score: -1 })
      .limit(10);
    res.json(scores);
  } catch (error) {
    console.error("Could not get scores:", error);
    res.status(500).json({
      message: "Failed to fetch scores",
    });
  }
});

module.exports = router;
