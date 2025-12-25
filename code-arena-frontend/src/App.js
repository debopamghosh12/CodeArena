import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import Chat from "./Chat";
import Timer from "./Timer";
import Auth from "./Auth";

const socket = io.connect("http://localhost:5000");

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");

  const [room, setRoom] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [showChat, setShowChat] = useState(false);
  const [problem, setProblem] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // UI State: 'create' or 'join'
  const [mode, setMode] = useState("create"); 

  const handleLogin = (userToken, userName) => {
    setToken(userToken);
    setUsername(userName);
  };

  // --- SYSTEM GENERATED ID ---
  const createRoom = () => {
    // Random 6-character ID (e.g., A7X9P2)
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom(roomId);
    
    // Auto Join
    socket.emit("join_room", { room: roomId, difficulty });
    setShowChat(true);
  };

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", { room, difficulty }); // Joiner er difficulty matter kore na
      setShowChat(true);
    }
  };

  useEffect(() => {
    const handleQuestion = (data) => {
      setProblem(data.problem);
      setStartTime(data.startTime);
    };

    socket.on("load_question", handleQuestion);
    return () => socket.off("load_question", handleQuestion);
  }, []);

  if (!token) {
    return (
      <div className="App">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>⚡ Code Arena ⚡</h3>
          <p>Welcome, <b style={{color: "#2ea043"}}>{username}</b>! 🚀</p>

          {/* TOGGLE TABS */}
          <div className="tab-container">
            <button 
                className={mode === "create" ? "tab active" : "tab"} 
                onClick={() => setMode("create")}
            >
                Create Room
            </button>
            <button 
                className={mode === "join" ? "tab active" : "tab"} 
                onClick={() => setMode("join")}
            >
                Join Room
            </button>
          </div>

          {/* CREATE MODE */}
          {mode === "create" ? (
            <div className="tab-content">
                <label>Select Difficulty:</label>
                <select 
                    className="difficulty-selector"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium </option>
                    <option value="hard">🔴 Hard </option>
                </select>
                <button className="btn-primary" onClick={createRoom}>
                    GENERATE & START ⚔️
                </button>
            </div>
          ) : (
            /* JOIN MODE */
            <div className="tab-content">
                <label>Enter Room ID:</label>
                <input
                    type="text"
                    placeholder="e.g. A7X9P2"
                    onChange={(e) => setRoom(e.target.value)}
                />
                <button className="btn-primary" onClick={joinRoom}>
                    JOIN BATTLE 🛡️
                </button>
            </div>
          )}

        </div>
      ) : (
        <div className="arena-container">
          <div className="editor-section">
            <div className="top-bar">
               <div className="room-info">
                 ROOM ID: <b style={{color: "#da3633", fontSize: "18px"}}>{room}</b> | PLAYER: <b>{username}</b>
               </div>
               {startTime && <Timer startTime={startTime} />}
            </div>
            <CodeEditor socket={socket} roomId={room} problem={problem} />
          </div>
          <div className="sidebar-section">
            <Chat socket={socket} username={username} room={room} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;