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
  
  // 🔥 PROBLEM STATE (Eta null thakle 'Connecting...' dekhay)
  const [problem, setProblem] = useState(null);

  // 1. Listen for Incoming Questions
  useEffect(() => {
    socket.on("load_question", (data) => {
      console.log("🔥 Mission Received from Server:", data); // Console check korbi
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

  const handleJoinRoom = () => {
    if (room !== "" && username !== "") {
      console.log("🚀 Joining Room:", room);
      // Join Room Event Send
      socket.emit("join_room", { room, difficulty: "easy" });
      setShowEditor(true);
    }
  };

  return (
    <div className="App">
      {!username ? (
        <Auth onLogin={handleLogin} />
      ) : !showEditor ? (
        <div className="join-container" style={{
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100vh", 
            color: "white"
        }}>
          <h2>🚀 Welcome, {username}!</h2>
          <div style={{background: "#2d2d2d", padding: "20px", borderRadius: "10px"}}>
            <input
                type="text"
                placeholder="Enter Room ID (e.g. ROOM1)"
                onChange={(event) => setRoom(event.target.value)}
                style={{padding: "10px", marginRight: "10px", borderRadius: "5px", border: "none"}}
            />
            <button 
                onClick={handleJoinRoom}
                style={{padding: "10px 20px", background: "#007acc", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"}}
            >
                Start Mission ⚔️
            </button>
          </div>
        </div>
      ) : (
        // Pass problem & username to Editor
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