//import express, make router, and import Hilo Score moodel
const express = require("express");
const router = express.Router();
const HiloScoreModel = require("../../models/HiloScoreModel");

// making the post route
router.post("/:username", async (req, res) => {

  // reading username from URL param
  const username = req.params.username;

  // reading data from request body
  const gamemode = req.body.gamemode;
  const score = Number(req.body.score);

  try {

    // making sure score is a number
    if (Number.isNaN(score)) {
      return res.status(400).json({ message: "Score must be a number" });
    }

    // creating new HiLo score document
    const newScore = new HiloScoreModel({
      username: username,
      gamemode: gamemode,
      score: score,
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