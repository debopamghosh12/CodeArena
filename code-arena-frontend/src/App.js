import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Auth from "./Auth";
import CodeEditor from "./CodeEditor";
import Chat from "./Chat";
import "./App.css";

const socket = io.connect("https://code-arena-backend-w7vw.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [problem, setProblem] = useState(null);
  
  // Dashboard States
  const [joinRoomId, setJoinRoomId] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  useEffect(() => {
    socket.on("load_question", (data) => {
      if (data && data.problem) setProblem(data.problem);
    });
    return () => socket.off("load_question");
  }, []);

  const handleLogin = (user) => setUsername(user);

  // ➤ OPTION A: CREATE ROOM (Auto Gen ID + Difficulty)
  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., X7K9P2
    setRoom(randomId);
    console.log(`Creating Room: ${randomId} | Mode: ${difficulty}`);
    
    // Server ke bolo difficulty shoho room banate
    socket.emit("join_room", { room: randomId, difficulty: difficulty });
    setShowEditor(true);
  };

  // ➤ OPTION B: JOIN ROOM (Manual ID Input)
  const handleJoinRoom = () => {
    if (joinRoomId.trim() === "") {
      alert("Please enter a valid Room ID!");
      return;
    }
    const upperId = joinRoomId.toUpperCase().trim();
    setRoom(upperId);
    console.log(`Joining Room: ${upperId}`);
    
    // Join korle difficulty matter kore na (Question already loaded thake)
    socket.emit("join_room", { room: upperId, difficulty: "easy" });
    setShowEditor(true);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(room);
    alert("Room ID Copied: " + room);
  };

  return (
    <div className="App">
      {!username ? (
        <Auth onLogin={handleLogin} />
      ) : !showEditor ? (
        // ➤ DASHBOARD (CREATE OR JOIN)
        <div className="join-container" style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "white"}}>
          <h1>👋 Welcome, {username}!</h1>
          <p style={{color: "#aaa"}}>Choose your path, warrior.</p>
          
          <div className="dashboard-container">
            
            {/* CARD 1: CREATE ROOM */}
            <div className="card">
                <h3>🛠 Create Battle</h3>
                <p style={{fontSize: "0.8rem", color: "#ccc"}}>Start a new match with custom rules.</p>
                
                <label style={{display:"block", textAlign:"left", fontSize:"0.8rem", marginLeft:"5%"}}>Difficulty:</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy (Warmup)</option>
                    <option value="medium">Medium (Challenge)</option>
                    <option value="hard">Hard (Nightmare)</option>
                </select>

                <button className="btn-action btn-create" onClick={handleCreateRoom}>
                    ⚡ AUTO CREATE & START
                </button>
            </div>

            {/* CARD 2: JOIN ROOM */}
            <div className="card">
                <h3>🤝 Join Battle</h3>
                <p style={{fontSize: "0.8rem", color: "#ccc"}}>Enter a friend's Room ID to join.</p>
                
                <label style={{display:"block", textAlign:"left", fontSize:"0.8rem", marginLeft:"5%"}}>Room ID:</label>
                <input 
                    type="text" 
                    placeholder="e.g. X7K9P2" 
                    value={joinRoomId} 
                    onChange={(e) => setJoinRoomId(e.target.value)}
                />

                <button className="btn-action btn-join" onClick={handleJoinRoom}>
                    🚀 ENTER ROOM
                </button>
            </div>

          </div>
        </div>
      ) : (
        // ➤ BATTLEFIELD (NAVBAR + SPLIT SCREEN)
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            
            {/* 🔥 TOP NAVBAR (ROOM ID IS HERE) */}
            <div className="navbar">
                <div className="nav-brand">
                    <span>⚔️ CODE ARENA</span>
                </div>
                
                <div className="room-info" onClick={copyRoomId} style={{cursor: "pointer", title: "Click to Copy"}}>
                    ROOM ID: <strong>{room}</strong> 📋
                </div>

                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <span>👤 {username}</span>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{background: "#d9534f", border: "none", color: "white", padding: "5px 10px", borderRadius: "4px", cursor: "pointer"}}
                    >
                        Exit
                    </button>
                </div>
            </div>

            {/* SPLIT LAYOUT */}
            <div className="battle-arena" style={{display: "flex", flex: 1, overflow: "hidden"}}>
                <div style={{flex: 0.75, borderRight: "1px solid #333"}}>
                    <CodeEditor
                    socket={socket}
                    roomId={room}
                    problem={problem}
                    username={username}
                    />
                </div>
                <div style={{flex: 0.25}}>
                    <Chat socket={socket} username={username} room={room} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;