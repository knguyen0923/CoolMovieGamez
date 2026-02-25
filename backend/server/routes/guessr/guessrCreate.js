const express = require("express");
const router = express.Router();
const newUserModel = require('../guessr/users')

router.post('/guesserCreate', async (req, res) => {

    const username = req.body.username;
    const score = req.body.score;

    try {
        const newscore = new Score({
          user:username,
          value:score
        });

        await newscore.save(); 
        res.status(201).json({ message: 'Score saved successfully' });
      } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ message: 'Failed to save score' });
  } 
})
  module.exports = router;