import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8081";

export default function Navbar({ darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, [location]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    fetch(`${API_BASE}/api/userProfile/${user.username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile || null);
      })
      .catch((err) => {
        console.error("Error loading navbar profile:", err);
      });
  }, [user, location]);

  // 🔥 live updates (cosmetics + coins)
  useEffect(() => {
    const syncProfile = () => {
      const userInfo = getUserInfo();
      if (!userInfo) return;

      fetch(`${API_BASE}/api/userProfile/${userInfo.username}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data.profile || null);
        })
        .catch((err) => {
          console.error("Error syncing navbar profile:", err);
        });
    };

    window.addEventListener("cosmeticsUpdated", syncProfile);
    window.addEventListener("coinsUpdated", syncProfile);

    return () => {
      window.removeEventListener("cosmeticsUpdated", syncProfile);
      window.removeEventListener("coinsUpdated", syncProfile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const buildImageUrl = (avatarUrl) => {
    if (!avatarUrl) return "https://via.placeholder.com/32";

    if (avatarUrl.startsWith("http")) return avatarUrl;

    if (avatarUrl.startsWith("/uploads/")) {
      return `${API_BASE}${avatarUrl}`;
    }

    return `${API_BASE}/uploads/${avatarUrl}`;
  };

  const rainbowText =
    profile?.usernameStyle === "rainbow"
      ? {
          background:
            "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold"
        }
      : {};

  const avatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "8px",
    border:
      profile?.avatarBorder === "gold"
        ? "2px solid gold"
        : darkMode
        ? "2px solid #888"
        : "2px solid #ccc"
  };

  const rainbowContainer =
    profile?.profileBorder === "rainbow"
      ? {
          border: "2px solid transparent",
          borderRadius: "10px",
          padding: "4px 10px",
          backgroundImage:
            "linear-gradient(#212529, #212529), linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          display: "flex",
          alignItems: "center"
        }
      : {
          display: "flex",
          alignItems: "center"
        };

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <ReactNavbar.Brand href="/">CoolMovieGamez</ReactNavbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/hilo">Hilo</Nav.Link>
          <Nav.Link href="/guessr">Guessr</Nav.Link>
          <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>

          {user?.role === "admin" && (
            <Nav.Link as={Link} to="/admin" className="text-danger fw-bold">
              Admin
            </Nav.Link>
          )}

          {user && (
            <>
              <Nav.Link as={Link} to="/shop">
                Shop
              </Nav.Link>

              {/* 👤 Profile + 💰 Coins */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                
                {/* Profile (clickable) */}
                <Nav.Link href="/privateUserProfile" style={{ padding: "0" }}>
                  <div style={rainbowContainer}>
                    <img
                      src={buildImageUrl(profile?.avatarUrl)}
                      alt="profile"
                      style={avatarStyle}
                    />
                    <span style={rainbowText}>{user.username}</span>
                  </div>
                </Nav.Link>

                {/* Coins (not clickable) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    backgroundColor: darkMode ? "#2a2a2a" : "#f1f1f1",
                    color: darkMode ? "#fff" : "#000",
                    fontSize: "14px",
                    boxShadow: "0 0 6px rgba(255, 215, 0, 0.5)"
                  }}
                >
                  <img
                    src="https://coolmoviegamez-avatars.s3.us-east-2.amazonaws.com/dollar.png"
                    alt="coin"
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span>{profile?.coins ?? 0}</span>
                </div>

              </div>

              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </>
          )}

          {!user && (
            <>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/signup">Sign Up</Nav.Link>
            </>
          )}

          <Nav.Link onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙" : "☀️"}
          </Nav.Link>
        </Nav>
      </Container>
    </ReactNavbar>
  );
}