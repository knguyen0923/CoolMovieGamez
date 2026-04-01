import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const Landingpage = () => {
  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <Card.Body style={{ textAlign: "center" }}>
          <Card.Title style={styles.title}>
            Welcome to CoolMovieGamez
          </Card.Title>

          <Card.Subtitle style={styles.subtitle}>
            Made by Mario, Nolen, James, Ken
          </Card.Subtitle>

          <Card.Text style={styles.text}>
            Sign up or log in to play games, track your score, and compete on the leaderboard.
          </Card.Text>

          <div style={styles.buttonContainer}>
            <Button href="/signup" style={styles.button}>
              Sign Up
            </Button>

            <Button href="/login" style={styles.button}>
              Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a90e2"
  },
  card: {
    width: "30rem",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)"
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px"
  },
  subtitle: {
    marginBottom: "15px",
    color: "gray"
  },
  text: {
    marginBottom: "20px"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px"
  },
  button: {
    backgroundColor: "black",
    border: "none",
    padding: "10px 20px"
  }
};

export default Landingpage;