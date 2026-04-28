import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import getUserInfo from "../../utilities/decodeJwt";

const Landingpage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

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

          <img
            src="https://coolmoviegamez-avatars.s3.us-east-2.amazonaws.com/IMG_1341.jpg"
            alt="landing"
            style={styles.image}
          />
          
          <Card.Text style={styles.text}>
            {!user
              ? "Sign up or log in to play games, track your score, and compete on the leaderboard."
              : "Start playing games, track your score, and compete on the leaderboard."}
          </Card.Text>

          <div style={styles.buttonContainer}>
            {!user ? (
              <>
                <Button href="/signup" style={styles.button}>
                  Sign Up
                </Button>

                <Button href="/login" style={styles.button}>
                  Login
                </Button>
              </>
            ) : (
              <Button href="/hilo" style={styles.button}>
                Start Playing
              </Button>
            )}
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
    backgroundImage:
      "url('https://coolmoviegamez-avatars.s3.us-east-2.amazonaws.com/Cool.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },
  card: {
    width: "30rem",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px"
  },
  subtitle: {
    marginBottom: "15px",
    color: "gray"
  },
  image: {
    width: "200px",
    margin: "20px auto",
    display: "block",
    borderRadius: "10px"
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