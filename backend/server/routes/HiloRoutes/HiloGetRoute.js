//import express, make router, and import Hilo Score moodel
const express = require("express");
const router = express.Router();
const HiloScoreModel = require("../../models/HiloScoreModel");

// making the get route
router.get("/getAll", async(req, res) => {
    // waits for mongo to return the scores
  const scores = await HiloScoreModel.find();
  //returning score
  return res.json(scores);
});

//returning them as JSON
module.exports = router;