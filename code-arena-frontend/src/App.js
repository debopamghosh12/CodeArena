import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Auth from "./Auth";
import CodeEditor from "./CodeEditor";
import "./App.css";

// 👇 IMPORTANT: Link-er sheshe kono '/' dibi na!
const socket = io.connect("https://code-arena-backend-w7vw.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    socket.on("load_question", (data) => {
      console.log("🔥 Mission Data Received:", data); 
      if (data && data.problem) {
        setProblem(data.problem);
      }
    });

    return () => {
      socket.off("load_question");
    };
  }, []);

  const handleLogin = (user) => {
    setUsername(user); 
  };

  // 🔥 NOTUN FUNCTION: Automatic Room ID Generate kobe
  const createBattle = () => {
    // Random 6 character ID (e.g., 'X7K9P2')
    const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setRoom(randomRoomId);
    console.log("🚀 Creating Room:", randomRoomId);
    
    // Server ke bolo room create korte
    socket.emit("join_room", { room: randomRoomId, difficulty: "easy" });
    setShowEditor(true);
  };

  return (
    <div className="App">
      {!username ? (
        <Auth onLogin={handleLogin} />
      ) : !showEditor ? (
        <div className="join-container" style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "white"}}>
          <h1>👋 Welcome, {username}!</h1>
          
          <div style={{background: "#252526", padding: "40px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)", textAlign: "center"}}>
            <h2 style={{marginTop: 0, color: "#61dafb", marginBottom: "20px"}}>Ready for War? ⚔️</h2>
            
            <p style={{color: "#aaa", marginBottom: "30px"}}>
              Click below to generate a new Battle Room <br/> and get your mission.
            </p>

            {/* 🔥 BUTTON CHANGED: Ekhon ar Input nei, Direct Button */}
            <button 
                onClick={createBattle}
                style={{
                  padding: "15px 30px", 
                  background: "linear-gradient(45deg, #ff0055, #ffcc00)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "50px", 
                  cursor: "pointer", 
                  fontWeight: "bold", 
                  fontSize: "18px",
                  boxShadow: "0 4px 15px rgba(255, 0, 85, 0.4)"
                }}
            >
                🔥 CREATE BATTLE
            </button>
          </div>
        </div>
      ) : (
        <CodeEditor
          socket={socket}
          roomId={room}
          problem={problem}
          username={username}
        />
      )}
    </div>
  );
}

export default App;