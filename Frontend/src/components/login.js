import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [instructorId, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { instructorId, password });  // Log input values
    try {
      const response = await axios.post("http://localhost:5000/login", { 
        instructorId,
        password 
      }, { 
        withCredentials: true 
      });
     
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
    <div className="login-container">
      <h2>Instructor Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Instructor ID" value={instructorId} 
        onChange={(e) => setId(e.target.value)} required/>
        <input type="password" placeholder="Password" value={password} 
        onChange={(e) => setPassword(e.target.value)} required/>
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
