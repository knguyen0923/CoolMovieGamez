import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  useEffect(() => {
    const syncDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    window.addEventListener("storage", syncDarkMode);

    const interval = setInterval(syncDarkMode, 200);

    return () => {
      window.removeEventListener("storage", syncDarkMode);
      clearInterval(interval);
    };
  }, []);

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: darkMode ? "#121212" : "#f4f4f4",
      color: darkMode ? "#ffffff" : "#000000",
      transition: "all 0.3s ease"
    },
    card: {
      background: darkMode ? "#1e1e1e" : "white",
      color: darkMode ? "#ffffff" : "#000000",
      padding: "40px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: darkMode
        ? "0 0 12px rgba(255,255,255,0.08)"
        : "0 0 15px rgba(0,0,0,0.2)",
      width: "520px",
      transition: "all 0.3s ease"
    },
    title: {
      marginBottom: "10px"
    },
    infoBox: {
      marginTop: "20px",
      marginBottom: "20px",
      fontSize: "16px",
      lineHeight: "1.6"
    },
    buttonGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginTop: "20px",
      marginBottom: "20px"
    },
    navButton: {
      padding: "14px",
      backgroundColor: darkMode ? "#2f2f2f" : "black",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      height: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold"
    },
    logoutButton: {
      padding: "14px",
      backgroundColor: darkMode ? "#2f2f2f" : "black",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      height: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold"
    }
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Please log in to continue</h2>
        </div>
      </div>
    );
  }

  const { id, email, username, firstName, lastName } = user;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login Successful</h1>
        <h2>Welcome to CoolMovieGamez!</h2>

        <div style={styles.infoBox}>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Name:</strong> {firstName} {lastName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>User ID:</strong> {id}</p>
        </div>

        <div style={styles.buttonGrid}>
          <button style={styles.navButton} onClick={() => navigate("/hilo")}>
            Hilo
          </button>
          <button style={styles.navButton} onClick={() => navigate("/guessr")}>
            Guessr
          </button>
          <button style={styles.navButton} onClick={() => navigate("/leaderboard")}>
            Leaderboard
          </button>
          <button style={styles.navButton} onClick={() => navigate("/shop")}>
            Shop
          </button>
          <button
            style={styles.navButton}
            onClick={() => navigate("/privateUserProfile")}
          >
            Profile
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
          Log Out
        </button>
        </div>

        
      </div>
    </div>
  );
};

export default HomePage;