const express = require("express");
const router = express.Router();
const movies = require("../../models/apiModel");

// GET 2+ movies for HiLo
router.get("/movies", async (req, res) => {
  try {
    const randomMovies = await movies.aggregate([
      { $match: { poster: { $ne: null } } },
      { $sample: { size: 10 } }
    ]);

    const formatted = randomMovies.map(m => ({
      movieid: m._id,
      title: m.title,
      poster: m.poster,
      votecount: m.votecount || Math.floor(Math.random() * 100000)
    }));

    if (formatted.length < 2) {
      return res.status(400).json({ message: "Not enough movies" });
    }

    res.json(formatted);

  } catch (err) {
    console.error("HiLo movie error:", err);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
});

module.exports = router;