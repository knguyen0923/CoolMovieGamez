const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL || "https://cool-movie-gamez.onrender.com"
    : "http://localhost:8081";

export default API_BASE;