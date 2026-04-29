const express = require("express");
const router = express.Router();
const axios = require("axios");

const apiData = require('../../models/apiModel');

router.post('/', async (req, res) => {
  try {
    const response = await axios('https://api.imdbapi.dev/titles?types=MOVIE');
    const movies = response.data.titles;
    //console.log(response.data); //check data is being pulled correctly
    console.log(JSON.stringify(response.data, null, 2));
    //loop to save data
    const formattedMovies = movies.map(movie => ({
      movieid: movie.id,
      title: movie.primaryTitle,
      originalTitle: movie.originalTitle || "n/a",

      poster: movie.primaryImage?.url || "n/a", 
      posterheight: movie.primaryImage?.height || 0,
      posterwidth: movie.primaryImage?.width || 0,

      rating: movie.rating?.aggregateRating ?? 0,
      votecount: movie.rating?.voteCount ?? 0,

      countrycode: movie.originCountries?.code || "n/a",
      countryname: movie.originCountries?.name || "n/a",

      languagecode: movie.spokenLanguages?.code || "n/a",
      languagename: movie.spokenLanguages?.name || "n/a",

      startYear: movie.startYear ?? null,      
      movie: movie.type || "n/a",
      runtimeSeconds: movie.runtimeSeconds ?? 0,
      genres: movie.genres ?? [],
      plot: movie.plot?.plotText || "n/a",
    }));

  await apiData.insertMany(formattedMovies);

    res.status(201).json({ message: 'Movies saved successfully' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to save API data' });
  }
});

module.exports = router;