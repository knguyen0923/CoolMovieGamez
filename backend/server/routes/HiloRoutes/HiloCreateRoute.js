//Loading express
const express = require("express");
const router = express.Router();

//importing HiLo Score model
const HiloScoreModel = require("../../models/HiloScoreModel");

// post route to create a new HiLo score
router.post("/create", async (req, res) => {
  
  // try to prevent server crash if something fails
    try {

        //reading data from request body
    const { username, score } = req.body;

    //creating new HiLo score document using the model and data from request body
        const newScore = new HiloScoreModel({
            username: username,
            score: score,
            date:new Date(),

        });

    //saving to mongodb
    const savedScore = await newScore.save();

    //returning saved record to client
    return res.json(savedScore);


    //handling error, returning JSON response and error code
  } catch (error) {
    return res.status(500).json({ error: "Failed to create HiLo score" });
  }
});

//export router
module.exports = router;