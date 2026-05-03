const express = require("express");
const router = express.Router();
const movies = require("../../models/apiModel");
const fetch = require("node-fetch");
const { GoogleGenAI } = require("@google/genai");

const rounds = new Map();

// CHANGE: fixed production backend URL.
const BASE_URL = process.env.BASE_URL || "https://coolmoviegamez.onrender.com";

// CHANGE: safe User-Agent for Nominatim/OpenStreetMap.
const NOMINATIM_USER_AGENT =
  process.env.FOR_THE_MAP_API || "CoolMovieGamez/1.0";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

// CHANGE: fallback locations prevent Guessr from crashing if Gemini or city lookup fails.
const FALLBACK_LOCATIONS = [
  { city: "New York", truelat: 40.7128, truelng: -74.006 },
  { city: "Los Angeles", truelat: 34.0522, truelng: -118.2437 },
  { city: "Chicago", truelat: 41.8781, truelng: -87.6298 },
  { city: "London", truelat: 51.5072, truelng: -0.1276 },
  { city: "Paris", truelat: 48.8566, truelng: 2.3522 },
  { city: "Tokyo", truelat: 35.6762, truelng: 139.6503 },
  { city: "Rome", truelat: 41.9028, truelng: 12.4964 },
  { city: "Toronto", truelat: 43.6532, truelng: -79.3832 },
  { city: "San Francisco", truelat: 37.7749, truelng: -122.4194 },
  { city: "Las Vegas", truelat: 36.1716, truelng: -115.1391 },
];

const getRandomFallbackLocation = () => {
  return FALLBACK_LOCATIONS[
    Math.floor(Math.random() * FALLBACK_LOCATIONS.length)
  ];
};

const cleanCityName = (value) => {
  if (!value) return "";

  return String(value)
    .replace(/[^a-zA-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

async function getCoordinates(cityName) {
  const cleanedCity = cleanCityName(cityName);

  if (!cleanedCity) {
    throw new Error("City name was empty");
  }

  console.log("Getting coordinates for city:", cleanedCity);

  // CHANGE: use local fallback coordinates first.
  const localMatch = FALLBACK_LOCATIONS.find(
    (location) => location.city.toLowerCase() === cleanedCity.toLowerCase()
  );

  if (localMatch) {
    return {
      truelat: localMatch.truelat,
      truelng: localMatch.truelng,
    };
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cleanedCity
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim failed with HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("City not found");
  }

  return {
    truelat: parseFloat(data[0].lat),
    truelng: parseFloat(data[0].lon),
  };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const toRad = (deg) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function submitElsewhere(username, score, coins) {
  try {
    if (!username || username === "Guest") {
      return;
    }

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

async function getCityForMovie(selectedMovie) {
  try {
    // CHANGE: Gemini is optional now.
    if (!ai) {
      console.warn("GEMINI_API_KEY missing. Using fallback city.");
      return getRandomFallbackLocation().city;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Name ONE major real city where the movie "${selectedMovie}" is primarily set. Respond with ONLY the city name. No punctuation. No extra text.`,
    });

    const generatedCity = cleanCityName(response.text);

    if (
      generatedCity &&
      /^[a-zA-Z\s]+$/.test(generatedCity) &&
      generatedCity.length <= 40
    ) {
      return generatedCity;
    }

    console.warn("Gemini returned invalid city:", response.text);
    return getRandomFallbackLocation().city;
  } catch (err) {
    console.error("Gemini city generation failed:", err.message);
    return getRandomFallbackLocation().city;
  }
}

async function generateValidRound(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // CHANGE: only sample movies with valid title and poster.
      const movieSample = await movies.aggregate([
        {
          $match: {
            title: { $exists: true, $ne: "" },
            poster: { $exists: true, $nin: [null, "", "N/A"] },
          },
        },
        { $sample: { size: 1 } },
      ]);

      const selectedMovieDoc = movieSample[0];

      if (!selectedMovieDoc?.title || !selectedMovieDoc?.poster) {
        console.warn("No valid movie with title/poster found.");
        continue;
      }

      const selectedMovie = selectedMovieDoc.title;
      const location = await getCityForMovie(selectedMovie);

      let truecoords;

      try {
        truecoords = await getCoordinates(location);
      } catch (coordErr) {
        console.error("Coordinate lookup failed:", coordErr.message);

        const fallback = getRandomFallbackLocation();

        truecoords = {
          truelat: fallback.truelat,
          truelng: fallback.truelng,
        };
      }

      console.log("Generated Guessr round:", {
        movie: selectedMovie,
        location,
        truecoords,
      });

      return {
        movie: selectedMovie,
        poster: selectedMovieDoc.poster,
        coords: truecoords,
        city: location,
      };
    } catch (err) {
      console.error(
        `Round generation retry ${i + 1}/${maxRetries}:`,
        err.message
      );
    }
  }

  // CHANGE: final emergency fallback instead of returning 500.
  const fallback = getRandomFallbackLocation();

  return {
    movie: "Mystery Movie",
    poster: "https://via.placeholder.com/400x600.png?text=Movie+Guessr",
    coords: {
      truelat: fallback.truelat,
      truelng: fallback.truelng,
    },
    city: fallback.city,
  };
}

router.get("/get", async (req, res) => {
  try {
    const round = await generateValidRound();

    const roundId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    rounds.set(roundId, {
      answer: round.coords,
      city: round.city,
    });

    // CHANGE: round now lasts 2 minutes instead of 1 minute.
    // Frontend timer is 30 seconds, so this gives enough buffer.
    setTimeout(() => {
      rounds.delete(roundId);
    }, 1000 * 60 * 2);

    return res.json({
      movie: round.movie,
      poster: round.poster,
      roundId,
    });
  } catch (error) {
    console.error("Round generation failed:", error);
    return res.status(500).json({ message: "Failed to generate round" });
  }
});

router.get("/test", async (req, res) => {
  try {
    const fallback = getRandomFallbackLocation();

    const movieSample = await movies.aggregate([
      {
        $match: {
          title: { $exists: true, $ne: "" },
          poster: { $exists: true, $nin: [null, "", "N/A"] },
        },
      },
      { $sample: { size: 1 } },
    ]);

    const selectedMovieDoc = movieSample[0];

    const roundId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    rounds.set(roundId, {
      answer: {
        truelat: fallback.truelat,
        truelng: fallback.truelng,
      },
      city: fallback.city,
    });

    setTimeout(() => {
      rounds.delete(roundId);
    }, 1000 * 60 * 2);

    return res.json({
      movie: selectedMovieDoc?.title || "Test Movie",
      poster:
        selectedMovieDoc?.poster ||
        "https://via.placeholder.com/400x600.png?text=Movie+Guessr",
      roundId,
    });
  } catch (error) {
    console.error("Test route failed:", error);
    return res.status(400).json({ message: "Failed to get test movie" });
  }
});

router.post("/post", async (req, res) => {
  try {
    const { username, lat, lng, timer, roundId, timedOut } = req.body;

    console.log("Guessr submission received:", {
      username,
      lat,
      lng,
      timer,
      roundId,
      timedOut,
    });

    const round = rounds.get(roundId);

    if (!round) {
      console.warn("Round not found for ID:", roundId);

      return res.json({
        timedOut: true,
        score: 0,
        coins: 0,
        distance: null,
        timerbonus: 0,
        answer: { city: "Unknown", lat: 0, lng: 0 },
        userGuess: null,
      });
    }

    let distance = null;
    let userscore = 0;
    let coinsEarned = 0;
    const timerbonus = Math.max(0, Number(timer) || 0) * 50;

    if (!timedOut && typeof lat === "number" && typeof lng === "number") {
      distance = haversineDistance(
        lat,
        lng,
        round.answer.truelat,
        round.answer.truelng
      );

      const maxscore = 10000;

      userscore = Math.max(
        0,
        Math.round(maxscore * Math.exp(-distance / 2000)) + timerbonus
      );

      coinsEarned = Math.round(userscore / 100);
    }

    rounds.delete(roundId);

    if (!timedOut) {
      await submitElsewhere(username, userscore, coinsEarned);
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
    return res.status(500).json({ message: "Failed to process guess" });
  }
});

module.exports = router;