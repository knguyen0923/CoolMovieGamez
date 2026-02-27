//import express, make router, and import Hilo Score moodel
const express = require("express");
const router = express.Router();
const HiloScoreModel = require("../../models/HiloScoreModel");

// making the get route
router.get("/", async (req, res) => {

  try {
    // waits for mongo to return the scores
    const scores = await HiloScoreModel.find().sort({ score: -1 });

    //returning score
    return res.json(scores);

  } catch (error) {
    console.error("Could not get HiLo scores:", error);
    return res.status(500).json({ message: "Failed to fetch HiLo scores" });
  }
});

//returning them as JSON
module.exports = router;