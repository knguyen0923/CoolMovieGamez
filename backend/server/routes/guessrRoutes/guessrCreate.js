const express = require("express");
const router = express.Router();

const guessrScore = require('../../models/guessrModel');

router.post('/guessrCreate', async (req, res) => {

    const username = req.body.username;
    const score = req.body.score;
    const game = "guessr";

    try {
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