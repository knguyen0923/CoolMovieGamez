import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import API_BASE from "../../utilities/config";

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = "#0c0c1f";
const url = `${API_BASE}/users/signup`;

const Register = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

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

  const usernameValid = data.username.length >= 6;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
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

  let registerCardStyle = {
    backgroundColor: darkMode
      ? "rgba(27, 27, 53, 0.9)"
      : "rgba(255, 255, 255, 0.9)",
    padding: "40px",
    borderRadius: "18px",
    border: `2px solid ${PRIMARY_COLOR}`,
    boxShadow: `0 0 18px ${PRIMARY_COLOR}`,
    width: "100%",
    maxWidth: "420px",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(url, data);
      window.alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP ERROR:", error.response?.data || error.message);

      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center align-items-center h-100"
            style={backgroundStyling}
          >
            <div className="d-flex justify-content-center w-100">
              <div style={registerCardStyle}>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={data.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter first name"
                      required
                      style={inputStyle}
                    />
                    {focusedField === "firstName" && (
                      <div style={helperBoxStyle}>First name is required.</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={data.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter last name"
                      required
                      style={inputStyle}
                    />
                    {focusedField === "lastName" && (
                      <div style={helperBoxStyle}>Last name is required.</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={data.username}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter username"
                      required
                      style={inputStyle}
                    />
                    {focusedField === "username" && (
                      <div style={helperBoxStyle}>
                        <div>
                          Username length:{" "}
                          <span style={usernameValid ? validStyle : invalidStyle}>
                            {data.username.length} characters
                          </span>
                        </div>
                        <div>Must be at least 6 characters.</div>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyling}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter email"
                      required
                      style={inputStyle}
                    />
                    {focusedField === "email" && (
                      <div style={helperBoxStyle}>
                        <div>Enter a valid email address like: name@example.com</div>
                        <div>
                          Status:{" "}
                          <span
                            style={
                              data.email.length === 0 || emailValid
                                ? validStyle
                                : invalidStyle
                            }
                          >
                            {data.email.length === 0
                              ? "waiting for input"
                              : emailValid
                              ? "valid email format"
                              : "invalid email format"}
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
                        <div>
                          Must be 8 characters or more:{" "}
                          <span style={passwordValid ? validStyle : invalidStyle}>
                            {passwordValid ? "valid" : "not valid"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Text style={{ color: darkMode ? "#aaa" : "#555" }}>
                      Already have an account?
                      <span>
                        <Link to="/login" style={labelStyling}>
                          {" "}Log in
                        </Link>
                      </span>
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <div style={labelStyling} className="pt-3">
                      {error}
                    </div>
                  )}

                  <Button type="submit" style={buttonStyling} className="mt-2 w-100">
                    Register
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

export default Register;