import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = "#0c0c1f";
const url = "http://localhost:8081/user/signup";

const Register = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState("Light Mode");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    if (light) {
      setBgColor("white");
      setBgText("Dark mode");
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText("Light mode");
    }
  }, [light]);

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
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicFirstName">
                  <Form.Label style={labelStyling}>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={data.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter your first name
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicLastName">
                  <Form.Label style={labelStyling}>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={data.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter your last name
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label style={labelStyling}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={data.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter a username
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label style={labelStyling}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter your email
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label style={labelStyling}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={data.password}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Text className="text-muted pt-1">
                    Already have an account?
                    <span>
                      <Link to="/login" style={labelStyling}>
                        {" "}Log in
                      </Link>
                    </span>
                  </Form.Text>
                </Form.Group>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="registerSwitch"
                    checked={light}
                    onChange={() => setLight(!light)}
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="registerSwitch"
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
                  Register
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;