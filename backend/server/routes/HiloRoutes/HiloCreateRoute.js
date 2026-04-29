//import express, make router, and import Hilo Score moodel
const express = require("express");
const router = express.Router();
const HiloScoreModel = require("../../models/HiloScoreModel");

// making the post route
router.post("/", async (req, res) => {

  // reading username from URL param
  const { username, gamemode, score, game } = req.body;

  try {

    // making sure score is a number
    if (Number.isNaN(score)) {
      return res.status(400).json({ message: "Score must be a number" });
    }

    // creating new HiLo score document
    const game = req.body.game; // or set it yourself

  const newScore = new HiloScoreModel({
    username,
    game,
    gamemode: req.body.gamemode, // only keep if schema also has gamemode
    score,
    date: new Date(),
  });

    // saving to mongodb
    await newScore.save();

    // returning success message
    return res.status(201).json({ message: "HiLo score saved successfully" });

  } catch (error) {
    console.error("Error saving HiLo score:", error);
    return res.status(500).json({ message: "Failed to save HiLo score" });
  }
});

//returning them as JSON
module.exports = router;