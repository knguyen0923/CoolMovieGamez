import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";

// changed to pass dark mode toggle
export default function Navbar({ darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, [location]);

  // logout function
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <ReactNavbar.Brand href="/">CoolMovieGamez</ReactNavbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/hilo">Hilo</Nav.Link>
          <Nav.Link href="/guessr">Guessr</Nav.Link>
          <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>

          {user && (
            <>
              <Nav.Link href="/privateUserProfile">
                {user.username ? `${user.username}'s Profile` : "User Profile"}
              </Nav.Link>
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