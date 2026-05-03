const express = require("express");
const router = express.Router();
const movies = require("../../models/apiModel");
const fetch = require("node-fetch");
const rounds = new Map(); // In-memory store for active rounds
const BASE_URL =
  process.env.BASE_URL || "https://coolmoviegamez.onrender.com";
const { GoogleGenAI } = require("@google/genai");
const { FOR_THE_MAP_API } = process.env;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// searches nominatim for city name, returns coordinates
async function getCoordinates(cityName) {
  console.log("Getting coordinates for city:", cityName);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": FOR_THE_MAP_API,
    },
  });
  const data = await res.json();

  if (!data.length) {
    throw new Error("City not found");
  }

  return {
    truelat: parseFloat(data[0].lat),
    truelng: parseFloat(data[0].lon),
  };
}

// calculates distance for coordinates for scoring
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km

  const toRad = (deg) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}

// updates leaderboard and coins on game complete
async function submitElsewhere(username, score, coins) {
  try {
    await fetch(`${BASE_URL}/api/leaderboard/guessr`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: "guessr",
        username,
        score,
      }),
    });

    await fetch(`${BASE_URL}/api/userProfile/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coinsDelta: coins,
      }),
    });
  } catch (err) {
    console.error("submitElsewhere failed:", err);
  }
}

// generates new round, checks if answers are valid, max retries 5
async function generateValidRound(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const movie = await movies.aggregate([{ $sample: { size: 1 } }]);
      const selectedmovie = movie[0]?.title;

      if (!selectedmovie) continue;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: `Name ONE major city where the movie "${selectedmovie}" is primarily set. 
                  Respond with ONLY the city name. If fictional, choose the closest real-world 
                  equivalent. No extra text.`,
      });

      const location = response.text?.trim();

      if (!location || !/^[a-zA-Z\s]+$/.test(location) || location.length > 40)
        continue;

      const truecoords = await getCoordinates(location);

      console.log("Generated round:", {
        movie: selectedmovie,
        location,
        truecoords,
        location,
      });

      return {
        movie: selectedmovie,
        poster: movie[0].poster,
        coords: truecoords,
        city: location,
      };
    } catch (err) {
      console.log("Retrying round generation...", err.message);
    }
  }

  throw new Error("Failed to generate valid round after retries");
}

// creates round id, returns movie and poster to FE
router.get("/get", async (req, res) => {
  try {
    const round = await generateValidRound();

    const roundId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    rounds.set(roundId, {
      answer: round.coords,
      city: round.city,
    });

    setTimeout(() => {
      rounds.delete(roundId);
    }, 1000 * 60); // delete after 1 minute

    res.json({
      movie: round.movie,
      poster: round.poster,
      roundId,
    });
  } catch (error) {
    console.error("Round generation failed:", error);
    res.status(500).json({ message: "Failed to generate round" });
  }
});

// used for testing, returns hardcoded movie and location for design mode
router.get("/test", async (req, res) => {
  try {
    const movie = await movies.aggregate([{ $sample: { size: 1 } }]);
    const selectedmovie = movie[0].title;
    const location = "Los Angeles";
    const truecoords = await getCoordinates(location);
    console.log("Test2", { location, truecoords });
    const roundId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    rounds.set(roundId, {
      answer: truecoords,
      city: location,
    });
    res.json({
      movie: selectedmovie,
      poster: movie[0].poster,
      roundId,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to get movie :(" });
  }
});

// normal game logic
router.post("/post", async (req, res) => {
  try {
    const { username, lat, lng, timer, roundId, timedOut } = req.body;
    console.log("RECEIVED:", { lat, lng });

    const round = rounds.get(roundId);

    if (!round) {
      console.warn("Round not found for ID:", roundId, "| Active rounds:", [
        ...rounds.keys(),
      ]);

      return res.json({
        timedOut: true,
        score: 0,
        coins: 0,
        distance: null,
        timerbonus: 0,
        answer: { city: "Unknown", lat: 0, lng: 0 }, // FIX: was null
        userGuess: null,
      });
    }

    let distance = null;
    let userscore = 0;
    let coinsEarned = 0;
    let timerbonus = timer * 50;

    if (!timedOut) {
      distance = haversineDistance(
        lat,
        lng,
        round.answer.truelat,
        round.answer.truelng,
      );

      const maxscore = 10000;

      userscore = Math.max(
        0,
        Math.round(maxscore * Math.exp(-distance / 2000)) + timerbonus,
      );

      coinsEarned = Math.round(userscore / 100);
    }

    rounds.delete(roundId);

    // Only update leaderboard if NOT timed out
    if (!timedOut) {
      await submitElsewhere(username, userscore, coinsEarned).catch((err) =>
        console.error("Leaderboard update error:", err),
      );
    }

    return res.json({
      roundId,
      timedOut,
      answer: {
        city: round.city,
        lat: round.answer.truelat,
        lng: round.answer.truelng,
      },
      score: userscore,
      coins: coinsEarned,
      distance: timedOut ? null : Math.round(distance),
      userGuess: timedOut ? null : { lat, lng },
      timerbonus,
    });
  } catch (error) {
    console.error("Error processing guess:", error);
    res.status(500).json({ message: "Failed to process guess :(" });
  }
});

module.exports = router;
