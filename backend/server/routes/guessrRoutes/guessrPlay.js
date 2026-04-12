const express = require("express");
const router = express.Router();
const movies = require('../../models/apiModel');
//const score = require('../../models/leaderboardModel');
//const coins = require('../../models/userProfile');
const fetch = require("node-fetch");

const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

//searches nominatim for city name, returns coordinates
async function getCoordinates(cityName) {
    console.log("Getting coordinates for city:", cityName);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;

    const res = await fetch(url, {
              headers: {
            "User-Agent": "CoolMovieGamez/1.0 (s0395343@salemstate.edu)"
        }
    });
    const data = await res.json();

    if (!data.length) {
        throw new Error("City not found");
    }

    return {
        truelat: parseFloat(data[0].lat),
        truelng: parseFloat(data[0].lon)
    };
}

//calculates distance for coordinates for scoring
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km

  const toRad = (deg) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}

let currentAnswer = null;
let actualCity = null;

router.get("/get", async (req, res) => {
  //get method to grab movie and location for the round
    try {   
        const movie = await movies.aggregate([
            {$sample: {size: 1} }
        ]);

        const selectedmovie = movie[0].title;
          console.log("Selected movie:", selectedmovie);

        if (!selectedmovie) {
          return res.status(404).json({ message: 'No movie found :(' });
        }

    //asking for location 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",         //free
      contents: `Where did the movie "${selectedmovie}" perform the best? Respond ONLY with the city name.`,
    });

    location = response.text?.trim();
    console.log("AI answer:", location);
    actualCity = location;

    currentAnswer = (await getCoordinates(location)) || null;
    console.log("Coordinates for answer:", currentAnswer);

        res.json({ movie: selectedmovie, poster: movie[0].poster });

        } catch (error) {
          console.error('Could not get movie:', error.response?.data || error.message || error);
          res.status(400).json({ message: 'Failed to get movie :(' });
      }
});

//~~~~~~~~~~~~~~used for testing, returns hardcoded movie and location for design mode
router.get("/test", async (req, res) => {
    try {   
        const movie = await movies.aggregate([
            {$sample: {size: 1} }
        ]);
        const selectedmovie = movie[0].title;
          console.log("Selected movie:", selectedmovie);
        if (!selectedmovie) {
          return res.status(404).json({ message: 'No movie found :(' });
        }
    location = "Los Angeles"; // Hardcoded location for testing
    console.log("Design Mode Location:", location);
    actualCity = location;
    currentAnswer = (await getCoordinates(location)) || null;
    console.log("Design Mode Answer Coordinates:", currentAnswer);
    console.log(location);

        res.json({ movie: selectedmovie, poster: movie[0].poster });
        } catch (error) {
          console.error('Could not get movie:', error.response?.data || error.message || error);
          res.status(400).json({ message: 'Failed to get movie :(' });
      }
});


router.post("/post", async (req, res) => {

  try {
    const {lat, lng} = req.body; // Get user's guess from request body
    console.log("User's guess:", { lat, lng });
    if(!currentAnswer) {
      return res.status(400).json({ message: 'No active game. Please start a new round.' });
  }
    const maxscore = 10000; // Max score for a perfect guess
    distance = haversineDistance(lat, lng, currentAnswer.truelat, currentAnswer.truelng);
const userscore = Math.max(0, Math.round(maxscore * Math.exp(-distance / 2000)));
    coins = Math.round(userscore / 100); 


  //returns the correct location and user's guess, and correct answer to display
  return res.json({
    answer: actualCity,
    correctLocation: currentAnswer, 
    score:userscore, 
    coins: coins, 
    distance: Math.round(distance),
    userGuess: {lat, lng},
  });

  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: 'Failed to process guess :(' });
  }
});

module.exports = router;