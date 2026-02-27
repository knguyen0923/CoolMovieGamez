const express = require("express");
const router = express.Router();
const guessrScore = require('../../models/guessrModel');

router.get('/user/:username/scores', async (req, res) => {

    const username = req.params.username

    try {
        const scores = await guessrScore.find({ username: username })
                                    .sort({ score: -1 }).limit(10);
                                    res.json(scores);

        } catch (error) {
        console.error('Could not get scores:', error);
    }
  })

  module.exports = router;