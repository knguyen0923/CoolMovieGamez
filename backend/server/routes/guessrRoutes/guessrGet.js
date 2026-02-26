const express = require("express");
const router = express.Router();
const guessrScore = require('../../models/guessrModel');

router.get('/users/:username/scores', async (req, res) => {

    const username = req.params.username

    try {
        const scores = await guessrScore.find({ user: username })
                                    .sort({ value: -1 }).limit(10);
                                    res.json(scores);

        res.json(scores);

        } catch (error) {
        console.error('Could not get scores:', error);
    }
  })

  module.exports = router;