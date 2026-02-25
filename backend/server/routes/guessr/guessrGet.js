const express = require("express");
const router = express.Router();
const newUserModel = require('../models/userModel');
const { use } = require("react");

router.get('/users/:username/scores', async (req, res) => {

    const username = req.params.username

    try {
        const scores = await Score.find({ user: username })
                                    .sort({ value: -1 }).limit(10);
                                    res.json(scores);
        } catch (error) {
        console.error('Could not get scores:', error);
    }
  })

  module.exports = router;