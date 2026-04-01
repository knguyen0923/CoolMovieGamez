import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const HomePage = () => {
  const [user, setUser] = useState(null);
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

        <button onClick={handleLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
    width: "400px",
  },
  title: {
    marginBottom: "10px",
  },
  infoBox: {
    marginTop: "20px",
    marginBottom: "20px",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "black",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default HomePage;