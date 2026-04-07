const express = require("express");
const router = express.Router();
const movies = require('../../models/apiModel');
const fetch = require("node-fetch");

const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function getCoordinates(cityName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) {
        throw new Error("City not found");
    }

    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
}

let currentAnswer = null;

router.get("/get", async (req, res) => {
  //get method to grab movie and location for the round
    try {   
      //getting movie from mongodb
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
      contents: `Where was the movie "${selectedmovie}" most popular? Respond ONLY with the city name.`,
    });

    const location = response.text?.trim();
    console.log("AI answer:", location);

    currentAnswer = location;

        res.json({ movie: selectedmovie, poster: movie[0].poster });

        } catch (error) {
          console.error('Could not get movie:', error.response?.data || error.message || error);
          res.status(400).json({ message: 'Failed to get movie :(' });
      }
});

//used for testing, returns hardcoded movie and location for design mode
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
    const location = "Los Angeles"; // Hardcoded location for testing
    console.log("Design Mode Location:", location);
    currentAnswer = location;
        res.json({ movie: selectedmovie, poster: movie[0].poster });
        } catch (error) {
          console.error('Could not get movie:', error.response?.data || error.message || error);
          res.status(400).json({ message: 'Failed to get movie :(' });
      }
});


router.post("/post", async (req, res) => {

  try {
    const {lat, lng} = req.body; // Get user's guess from request body


    //~~~~~~~~this is where guess logic will go and scoring and such ~~~~~~~~~


    if(!currentAnswer) {
      return res.status(400).json({ message: 'No active game. Please start a new round.' });
  }

  //returns the correct location and user's guess, and correct answer to display
  return res.json({
    correctLocation: currentAnswer,
    userGuess: { lat, lng, answer: currentAnswer },
  });

  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: 'Failed to process guess :(' });
  }
});

module.exports = router;