import React, { useState, useEffect } from "react";
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

  // Handle Code Change & Sync via Socket
  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("send_code", { code: value, room: roomId });
  };

  // Listen for incoming code changes
  useEffect(() => {
    socket.on("receive_code", (data) => {
      setCode(data.code);
    });
    return () => socket.off("receive_code");
  }, [socket]);

  // ➤ RUN CODE FUNCTION (Connected to Live Render Server)
  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code... ⏳");

    try {
      const testInput = problem?.testCases?.[0]?.input || "";
      
      // 👇 Updated with YOUR Render Backend Link
      const response = await axios.post("https://code-arena-backend-w7vw.onrender.com/api/compile", {
        code: code,
        language: language,
        input: testInput
      });

      const result = response.data.run.output;
      
      // LOGIC CHECK
      if (problem && problem.testCases) {
        const expected = problem.testCases[0].output.trim();
        const actual = result.trim();
        
        if (actual === expected) {
            setOutput(result);
            setIsWinner(true); // Trigger Confetti 🎉

            // ➤ SAVE SCORE TO DB (Live Backend)
            await axios.post("https://code-arena-backend-w7vw.onrender.com/api/users/win", { username });
        } else {
            setOutput(result + `\n\n❌ FAILED. Expected: "${expected}"`);
            setIsWinner(false);
        }
      } else {
          setOutput(result);
      }

    } catch (error) {
      setOutput("Error connecting to server ❌. Make sure backend is live!");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-editor-wrapper">
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      <div className="editor-header">
        <select 
          className="lang-select" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript (Node)</option>
          <option value="python">Python 3</option>
          <option value="cpp">C++</option>
        </select>

        {isWinner ? (
            <button className="btn-run" style={{background: "gold", color: "black", cursor: "default"}}>
                 🏆 WINNER!
            </button>
        ) : (
            <button className="btn-run" onClick={runCode} disabled={isRunning}>
            {isRunning ? "Running..." : "▶ Run Code"}
            </button>
        )}
      </div>

      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={handleEditorChange}
        options={{ fontSize: 14, scrollBeyondLastLine: false }}
      />

      <div className="output-terminal">
        <div className="terminal-header">TERMINAL_OUTPUT &gt;</div>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;