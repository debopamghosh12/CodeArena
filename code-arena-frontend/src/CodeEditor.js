import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Confetti from "react-confetti";
import "./App.css";

const CodeEditor = ({ socket, roomId, problem, username }) => {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  // ➤ SIZE STATE (Default 250px)
  const [terminalHeight, setTerminalHeight] = useState(250);
  const containerRef = useRef(null); 

  // Sync Code
  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("send_code", { code: value, room: roomId });
  };

  useEffect(() => {
    socket.on("receive_code", (data) => setCode(data.code));
    return () => socket.off("receive_code");
  }, [socket]);

  // ➤ DRAG RESIZE LOGIC
  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    
    const startY = mouseDownEvent.clientY; 
    const startHeight = terminalHeight;    

    const onMouseMove = (mouseMoveEvent) => {
      const newHeight = startHeight + (startY - mouseMoveEvent.clientY);
      if (newHeight > 50 && newHeight < window.innerHeight * 0.8) {
        setTerminalHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code on Render Server... ⏳");
    try {
      const testInput = problem?.testCases?.[0]?.input || "";
      const response = await axios.post("https://code-arena-backend-w7vw.onrender.com/api/compile", {
        code, language, input: testInput
      });

      const result = response.data.run.output;
      if (problem && problem.testCases) {
        const expected = problem.testCases[0].output.trim();
        const actual = result.trim();
        if (actual === expected) {
            setOutput(result + "\n\n✨ TEST PASSED! YOU WON! 🏆 ✨");
            setIsWinner(true);
            await axios.post("https://code-arena-backend-w7vw.onrender.com/api/users/win", { username });
        } else {
            setOutput(result + `\n\n❌ FAILED.\nExpected: "${expected}"\nGot: "${actual}"`);
            setIsWinner(false);
        }
      } else {
          setOutput(result);
      }
    } catch (error) {
      setOutput("Error connecting to server ❌.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-editor-wrapper" ref={containerRef}>
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      {/* 1. SCROLLABLE TOP SECTION */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        
        {/* Question Box */}
        {problem ? (
            <div className="question-box">
                <h3>📝 Mission: {problem.title}</h3>
                <p>{problem.description}</p>
                <div style={{fontSize: "0.85rem", color: "#aaa", marginTop: "10px", background: "#1e1e1e", padding: "10px", borderRadius: "5px"}}>
                    <strong>Input: </strong> {problem.testCases?.[0]?.input} <br/>
                    <strong>Output: </strong> {problem.testCases?.[0]?.output}
                </div>
            </div>
        ) : (
            <div className="question-box"><h3>⏳ Connecting...</h3></div>
        )}

        {/* Header */}
        <div className="editor-header">
            <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript (Node)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            </select>
            {isWinner ? (
                <button className="btn-run" style={{background: "gold", color: "black"}}>🏆 CHAMPION!</button>
            ) : (
                <button className="btn-run" onClick={runCode} disabled={isRunning}>
                {isRunning ? "Running..." : "▶ Run Code"}
                </button>
            )}
        </div>

        {/* EDITOR */}
        <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={handleEditorChange}
                options={{ fontSize: 14, scrollBeyondLastLine: false, minimap: { enabled: false } }}
            />
        </div>
      </div>

      {/* 2. DRAGGABLE HANDLE */}
      <div 
        className="resizer-handle"
        onMouseDown={startResizing} 
        title="Drag to resize terminal"
      >
        <div className="handle-dots"></div>
      </div>

      {/* 3. TERMINAL */}
      <div className="output-terminal" style={{ height: `${terminalHeight}px` }}>
        {/* 🔥 UPDATE: Removed the size text here */}
        <div className="terminal-header" style={{position: "sticky", top: 0, background: "#000", padding: "5px 0", borderBottom: "1px solid #333"}}>
            TERMINAL_OUTPUT &gt;
        </div>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;