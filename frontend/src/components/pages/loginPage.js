import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import getUserInfo from "../../utilities/decodeJwt";
import API_BASE from "../../config";

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = "#0c0c1f";
const url = `${API_BASE}/api/users/login`;

const Login = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ username: "", password: "" });
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const navigate = useNavigate();

  const usernameValid = data.username.trim().length >= 1;
  const passwordValid = data.password.trim().length >= 8;

  let labelStyling = {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };

  let backgroundStyling = {
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
      url('https://coolmoviegamez-avatars.s3.us-east-2.amazonaws.com/loginbg.jpg')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
  };

  let loginCardStyle = {
    backgroundColor: darkMode
      ? "rgba(27, 27, 53, 0.9)"
      : "rgba(255, 255, 255, 0.9)",
    padding: "40px",
    borderRadius: "18px",
    border: `2px solid ${PRIMARY_COLOR}`,
    boxShadow: `0 0 18px ${PRIMARY_COLOR}`,
    width: "100%",
  };

  let buttonStyling = {
    background: PRIMARY_COLOR,
    borderStyle: "none",
    color: darkMode ? SECONDARY_COLOR : "#fff",
  };

  const inputStyle = {
    backgroundColor: darkMode ? "#1b1b35" : "#ffffff",
    color: darkMode ? "#fff" : "#000",
    border: `2px solid ${PRIMARY_COLOR}`,
    borderRadius: "10px",
  };

  const helperBoxStyle = {
    background: darkMode ? "#1b1b35" : "#f8f9fa",
    color: darkMode ? "#f1f1f1" : "#333",
    padding: "8px 10px",
    borderRadius: "8px",
    marginTop: "6px",
    fontSize: "13px",
    border: `1px solid ${PRIMARY_COLOR}`,
  };

  const validStyle = {
    color: "green",
    fontWeight: "bold",
  };

  const invalidStyle = {
    color: "red",
    fontWeight: "bold",
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    const obj = getUserInfo();
    setUser(obj);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/LandingPage");
    }
  }, [user, navigate]);

  useEffect(() => {
    const updateDarkMode = () => {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    };

    window.addEventListener("storage", updateDarkMode);

    const interval = setInterval(updateDarkMode, 100);

    return () => {
      window.removeEventListener("storage", updateDarkMode);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center align-items-center h-100"
            style={backgroundStyling}
          >
            <div className="col-md-8 col-lg-6 col-xl-4">
              <div style={loginCardStyle}>
                <Form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError("");

                    try {
                      const response = await axios.post(url, data);
                      const { accessToken } = response.data;

                      localStorage.setItem("accessToken", accessToken);
                      setUser(getUserInfo());
                      navigate("/LandingPage");
                    } catch (error) {
                      console.log(
                        "LOGIN ERROR:",
                        error.response?.data || error.message
                      );

                      if (
                        error.response &&
                        error.response.status >= 400 &&
                        error.response.status <= 500
                      ) {
                        setError(error.response.data.message);
                      } else {
                        setError("Login failed");
                      }
                    }
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>
                      Username or Email
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="username"
                      value={data.username}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter username or email"
                      required
                      style={inputStyle}
                    />

                    {focusedField === "username" && (
                      <div style={helperBoxStyle}>
                        <div>Enter your username or your email address.</div>
                        <div>
                          Status:{" "}
                          <span style={usernameValid ? validStyle : invalidStyle}>
                            {usernameValid ? "valid" : "required"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>Password</Form.Label>

                    <Form.Control
                      type="password"
                      name="password"
                      value={data.password}
                      placeholder="Password"
                      onChange={handleChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      required
                      style={inputStyle}
                    />

                    {focusedField === "password" && (
                      <div style={helperBoxStyle}>
                        <div>Password must be 8 characters or more.</div>
                        <div>
                          Status:{" "}
                          <span style={passwordValid ? validStyle : invalidStyle}>
                            {passwordValid ? "valid" : "not valid"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Text style={{ color: darkMode ? "#aaa" : "#555" }}>
                      Dont have an account?
                      <span>
                        <Link to="/signup" style={labelStyling}>
                          {" "}
                          Sign up
                        </Link>
                      </span>
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <div style={labelStyling} className="pt-3">
                      {error}
                    </div>
                  )}

                  <Button type="submit" style={buttonStyling} className="mt-2">
                    Log In
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;