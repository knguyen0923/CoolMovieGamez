const express = require("express");
const router = express.Router();
const apiData = require('../../models/apiModel');

//mounted to base url .../api
router.get('/get', async (req, res) => {

    movieid = req.params.movieid

    try {   
        const movies = await apiData.aggregate([
            {$sample: {size: 20} }
        ]);

        res.json(movies);

        } catch (error) {
            
        console.error('Could not get movies:', error);
        res.status(400).json({ message: 'Failed to get movies :(' });
    }
  })

  module.exports = router;