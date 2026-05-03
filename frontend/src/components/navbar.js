import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import useHiloButtonSound from "../utilities/useHiloButtonSound";
import API_BASE from "../config";

const NAV_TAB_SOUND_PATH = "/sounds/506053__mellau__button-click-2.wav";

export default function Navbar({ darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  const playNavTabSound = useHiloButtonSound({
    soundPath: NAV_TAB_SOUND_PATH,
    volume: 0.45,
    errorLabel: "navbar tab sound",
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  /*
    CHANGE #1:
    Created one reusable profile loader instead of repeating fetch logic twice.

    CHANGE #2:
    Fixed the broken URL:
    OLD: `${API_BASE}/userProfile/${username}`
    NEW: `${API_BASE}/api/userProfile/${username}`

    Your backend mounts the route as:
    app.use("/api/userProfile", userProfileRoute);
  */
  const loadNavbarProfile = async (username) => {
    if (!username) {
      setProfile(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/userProfile/${username}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      /*
        CHANGE #3:
        Your backend returns the profile inside data.profile,
        so Navbar must use data.profile instead of data.avatarUrl directly.
      */
      setProfile(data.profile || null);
    } catch (err) {
      console.error("Error loading navbar profile:", err);
      setProfile(null);
    }
  };

  /*
    CHANGE #4:
    Reload the logged-in user whenever the route changes.
    This keeps the Navbar updated after login/logout/navigation.
  */
  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);

    if (userInfo?.username) {
      loadNavbarProfile(userInfo.username);
    } else {
      setProfile(null);
    }
  }, [location]);

  /*
    CHANGE #5:
    Listen for profile-related updates from Shop/Profile/HiLo.
    When cosmetics or coins change, the Navbar reloads the profile.
  */
  useEffect(() => {
    const syncProfile = () => {
      const userInfo = getUserInfo();

      if (!userInfo?.username) {
        setProfile(null);
        return;
      }

      setUser(userInfo);
      loadNavbarProfile(userInfo.username);
    };

    window.addEventListener("cosmeticsUpdated", syncProfile);
    window.addEventListener("coinsUpdated", syncProfile);
    window.addEventListener("profileUpdated", syncProfile);

    return () => {
      window.removeEventListener("cosmeticsUpdated", syncProfile);
      window.removeEventListener("coinsUpdated", syncProfile);
      window.removeEventListener("profileUpdated", syncProfile);
    };
  }, []);

  /*
    CHANGE #6:
    Build the correct image URL depending on whether avatarUrl is:
    - already a full URL, like S3
    - a backend uploads path, like /uploads/image.png
    - just a filename
  */
  const buildImageUrl = (avatarUrl) => {
    if (!avatarUrl) return "https://via.placeholder.com/32";

    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

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
          fontWeight: "bold",
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
        : "2px solid #ccc",
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
          alignItems: "center",
        }
      : {
          display: "flex",
          alignItems: "center",
        };

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <ReactNavbar.Brand as={Link} to="/LandingPage" onClick={playNavTabSound}>
          CoolMovieGamez
        </ReactNavbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/hilo" onClick={playNavTabSound}>
            Hilo
          </Nav.Link>

          <Nav.Link as={Link} to="/guessr" onClick={playNavTabSound}>
            Guessr
          </Nav.Link>

          <Nav.Link as={Link} to="/leaderboard" onClick={playNavTabSound}>
            Leaderboard
          </Nav.Link>

          {user?.role === "admin" && (
            <Nav.Link
              as={Link}
              to="/admin"
              className="text-danger fw-bold"
              onClick={playNavTabSound}
            >
              Admin
            </Nav.Link>
          )}

          {user && (
            <>
              <Nav.Link as={Link} to="/shop" onClick={playNavTabSound}>
                Shop
              </Nav.Link>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Nav.Link
                  as={Link}
                  to="/privateUserProfile"
                  style={{ padding: "0" }}
                  onClick={playNavTabSound}
                >
                  <div style={rainbowContainer}>
                    <img
                      src={buildImageUrl(profile?.avatarUrl)}
                      alt="profile"
                      style={avatarStyle}
                    />

                    <span style={rainbowText}>{user.username}</span>
                  </div>
                </Nav.Link>

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
                    boxShadow: "0 0 6px rgba(255, 215, 0, 0.5)",
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
              <Nav.Link as={Link} to="/login" onClick={playNavTabSound}>
                Login
              </Nav.Link>

              <Nav.Link as={Link} to="/signup" onClick={playNavTabSound}>
                Sign Up
              </Nav.Link>
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