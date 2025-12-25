import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Auth from "./Auth";
import CodeEditor from "./CodeEditor";
import Chat from "./Chat"; // 🔥 Import Chat
import "./App.css";

const socket = io.connect("https://code-arena-backend-w7vw.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    socket.on("load_question", (data) => {
      if (data && data.problem) setProblem(data.problem);
    });
    return () => socket.off("load_question");
  }, []);

  const handleLogin = (user) => setUsername(user);

  const createBattle = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom(randomRoomId);
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
          <div style={{background: "#252526", padding: "40px", borderRadius: "10px", textAlign: "center"}}>
            <h2 style={{color: "#61dafb"}}>Ready for War? ⚔️</h2>
            <button onClick={createBattle} style={{padding: "15px 30px", background: "#007acc", color: "white", border: "none", borderRadius: "50px", cursor: "pointer", fontSize: "18px", marginTop: "20px"}}>
                🔥 CREATE BATTLE
            </button>
          </div>
        </div>
      ) : (
        // 🔥 SPLIT SCREEN LAYOUT
        <div className="battle-arena" style={{display: "flex", width: "100%", height: "100vh", overflow: "hidden"}}>
            
            {/* LEFT: Editor (75%) */}
            <div style={{flex: 0.75, borderRight: "1px solid #333"}}>
                <CodeEditor
                socket={socket}
                roomId={room}
                problem={problem}
                username={username}
                />
            </div>

            {/* RIGHT: Chat (25%) */}
            <div style={{flex: 0.25}}>
                <Chat socket={socket} username={username} room={room} />
            </div>

        </div>
      )}
    </div>
  );
}

export default App;