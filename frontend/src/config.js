const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://cool-movie-gamez.onrender.com"
    : "http://localhost:8081";

export default API_BASE;