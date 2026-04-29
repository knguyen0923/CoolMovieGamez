const express = require("express");
const router = express.Router();

const guessrScore = require('../../models/guessrModel');

router.post('/', async (req, res) => {

    const { username, score } = req.body;
    const game = "guessr";

    try {
      if (!username) {
            return res.status(400).json({ message: "Username required" });
        }

        const newscore = new guessrScore({
          username:username,
          score:score,
          game:game
        });

        await newscore.save(); 
        res.status(201).json({ message: 'Guessr Score saved successfully' });
      } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ message: 'Failed to save score' });
  } 
})
  module.exports = router;