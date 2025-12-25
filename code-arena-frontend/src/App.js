import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Auth from "./Auth";
import CodeEditor from "./CodeEditor";
import "./App.css";

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
      } else {
        // Fallback for null problem
        console.warn("⚠️ Received NULL problem from server");
        setProblem({
            title: "Connection Test",
            description: "Server sent empty data. Write any code to test.",
            testCases: [{input: "1", output: "1"}]
        });
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
    if (room.trim() !== "" && username) {
      console.log("🚀 Joining Room:", room);
      socket.emit("join_room", { room, difficulty: "easy" });
      setShowEditor(true);
    } else {
        alert("Please enter a Room ID!");
    }
  };

  return (
    <div className="App">
      {!username ? (
        <Auth onLogin={handleLogin} />
      ) : !showEditor ? (
        <div className="join-container" style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "white"}}>
          <h1>👋 Welcome, {username}!</h1>
          
          <div style={{background: "#252526", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)"}}>
            <h3 style={{marginTop: 0, color: "#61dafb"}}>Enter Battle Arena ⚔️</h3>
            <input
                type="text"
                placeholder="Room ID (e.g. ROOM1)"
                onChange={(event) => setRoom(event.target.value)}
                style={{padding: "12px", width: "200px", marginRight: "10px", borderRadius: "5px", border: "1px solid #555", background: "#333", color: "white", fontSize: "16px"}}
            />
            <button 
                onClick={handleJoinRoom}
                style={{padding: "12px 24px", background: "#007acc", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "16px"}}
            >
                START
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