import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import getUserInfo from "../../utilities/decodeJwt";

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = "#0c0c1f";
const url = "http://localhost:8081/users/login";

const Login = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ username: "", password: "" });
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState("Light Mode");
  const navigate = useNavigate();

  const usernameValid = data.username.trim().length >= 1;
  const passwordValid = data.password.trim().length >= 8;

  let labelStyling = {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };

  let backgroundStyling = { background: bgColor };

  let buttonStyling = {
    background: PRIMARY_COLOR,
    borderStyle: "none",
    color: bgColor,
  };

  const helperBoxStyle = {
    background: light ? "#f8f9fa" : "#1b1b35",
    color: light ? "#333" : "#f1f1f1",
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
    if (light) {
      setBgColor("white");
      setBgText("Dark mode");
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText("Light mode");
    }
  }, [light]);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(url, data);
      const { accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      setUser(getUserInfo());
      navigate("/home");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

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
  };

  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center align-items-center h-100"
            style={backgroundStyling}
          >
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label style={labelStyling}>Username or Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={data.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Enter username or email"
                    required
                  />
                  {focusedField === "username" && (
                    <div style={helperBoxStyle}>
                      <div>
                        Enter your username or your email address.
                      </div>
                      <div>
                        Status:{" "}
                        <span style={usernameValid ? validStyle : invalidStyle}>
                          {usernameValid ? "valid" : "required"}
                        </span>
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
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
                  />
                  {focusedField === "password" && (
                    <div style={helperBoxStyle}>
                      <div>
                        Password must be 8 characters or more.
                      </div>
                      <div>
                        Status:{" "}
                        <span style={passwordValid ? validStyle : invalidStyle}>
                          {passwordValid ? "valid" : "not valid"}
                        </span>
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Text className="text-muted pt-1">
                    Dont have an account?
                    <span>
                      <Link to="/signup" style={labelStyling}>
                        {" "}Sign up
                      </Link>
                    </span>
                  </Form.Text>
                </Form.Group>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="loginSwitch"
                    checked={light}
                    onChange={() => setLight(!light)}
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="loginSwitch"
                  >
                    {bgText}
                  </label>
                </div>

                {error && (
                  <div style={labelStyling} className="pt-3">
                    {error}
                  </div>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  style={buttonStyling}
                  className="mt-2"
                >
                  Log In
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;