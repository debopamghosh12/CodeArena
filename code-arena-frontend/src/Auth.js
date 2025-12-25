import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const endpoint = isLogin ? "/login" : "/signup";
    // Make sure port 5000 is correct for your backend
    const url = `https://code-arena-backend-w7vw.onrender.com/api/auth${endpoint}`;

    try {
      const res = await axios.post(url, formData);
      
      if (isLogin) {
        // Login Successful -> NO ALERT -> Direct Entry
        onLogin(res.data.token, res.data.username); 
      } else {
        // Signup Successful -> Show Text Message, NO ALERT
        setMessage("✅ Signup Successful! Please Login now.");
        setIsLogin(true); // Switch to Login view automatically
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="joinChatContainer">
      <h3>{isLogin ? "Login" : "Register"}</h3>
      
      {!isLogin && (
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
        />
      )}
      
      <input 
        type="email" 
        name="email" 
        placeholder="Email Address" 
        onChange={handleChange} 
      />
      
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
        onChange={handleChange} 
      />

      <button className="btn-primary" onClick={handleSubmit}>
        {isLogin ? "Login" : "Sign Up"}
      </button>

      {/* Messages show korbe without Popup */}
      {message && <p style={{ color: "#2ea043", marginTop: "10px", fontWeight: "bold" }}>{message}</p>}
      {error && <p style={{ color: "#da3633", marginTop: "10px", fontWeight: "bold" }}>{error}</p>}

      <p 
        style={{ color: "#58a6ff", cursor: "pointer", marginTop: "15px", fontSize: "14px" }} 
        onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
            setError("");
        }}
      >
        {isLogin ? "New here? Create Account" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default Auth;