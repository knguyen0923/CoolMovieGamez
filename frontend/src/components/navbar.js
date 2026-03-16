import React, { useEffect, useState } from "react";
import getUserInfo from "../utilities/decodeJwt";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import ReactNavbar from "react-bootstrap/Navbar";

export default function Navbar() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  // logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    window.location.href = "/"; // redirect to home
  };

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>

        <ReactNavbar.Brand href="/">
          CoolMovieGamez
        </ReactNavbar.Brand>

        <Nav className="ms-auto">

          {/* Games always visible */}
          <Nav.Link href="/game1">Game 1</Nav.Link>
          <Nav.Link href="/game2">Game 2</Nav.Link>

          {/* Only visible when logged in */}
          {user && (
            <>
              <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
              <Nav.Link href="/privateUserProfile">User Profile</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </>
          )}

          {/* Only visible when NOT logged in */}
          {!user && (
            <Nav.Link href="/login">Login</Nav.Link>
          )}

        </Nav>

      </Container>
    </ReactNavbar>
  );
}