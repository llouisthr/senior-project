import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import MahidolLogo from "./mahidol-logo.png";

const Login = () => {
  const [instructorId, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { instructorId, password }); // Log input values
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          instructorId,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Login response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("instructorId", response.data.instructorId);
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Invalid id or password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img
          src={MahidolLogo}
          alt="Mahidol University Logo"
          className="mu-logo-svg"
        />

        <hr className="divider" />

        <h2 className="form-title">Sign in</h2>
        <p className="form-description">
          with your Mahidol University Accounts.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Instructor ID"
            value={instructorId}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="sign-in-button">
            Sign in
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <hr className="divider" />

        <div className="first-time-box">
          <p>
            <strong>Is this your first time here?</strong>
          </p>
          <p>
            <a href="#">Use your MU internet account for login</a>
          </p>
          <p>
            <strong>Ex.</strong>
            u6488xxx (for student),
            <br />
            <span className="teacher-example">pxxxx.xxx (for teacher)</span>
          </p>
        </div>

        <hr className="divider" />

        <p className="version">SP2024-35</p>
      </div>
    </div>
  );
};

export default Login;
