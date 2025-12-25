import React, { useState } from "react";
import axios from "axios";
import "./App.css"; 

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    const endpoint = isLogin ? "/login" : "/signup";
    
    try {
      // 👇 Link thik ache
      const url = `https://code-arena-backend-w7vw.onrender.com/api/auth${endpoint}`;
      
      const payload = isLogin ? { email, password } : { username, email, password };

      const res = await axios.post(url, payload);
      
      if (isLogin) {
        // 🔥 CRITICAL FIX: Send only the username string
        console.log("Login Success:", res.data);
        onLogin(res.data.username); 
      } else {
        setIsLogin(true);
        setError("Account created! Please log in.");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Authentication failed");
    }
  };

  return (
    <div className="auth-container" style={{textAlign: "center", marginTop: "50px", color: "white"}}>
      <h2>{isLogin ? "🔐 Login to Code Arena" : "📝 Sign Up"}</h2>
      
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "10px", width: "300px", margin: "0 auto"}}>
        {!isLogin && (
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{padding: "10px", borderRadius: "5px"}}/>
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{padding: "10px", borderRadius: "5px"}}/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{padding: "10px", borderRadius: "5px"}}/>
        
        <button type="submit" style={{padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "16px"}}>
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {error && <p style={{color: "#ff4d4d", marginTop: "10px", fontWeight: "bold"}}>{error}</p>}

      <p style={{marginTop: "20px", cursor: "pointer", color: "#61dafb"}} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "New here? Create an account" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default Auth;