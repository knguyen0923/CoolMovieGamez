const API_BASE = process.env.NODE_ENV === "production"
    ? "https://coolmoviegamez.onrender.com"
    : "http://localhost:8081";

export default API_BASE;