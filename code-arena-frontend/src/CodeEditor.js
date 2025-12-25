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

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("send_code", { code: value, room: roomId });
  };

  useEffect(() => {
    socket.on("receive_code", (data) => {
      setCode(data.code);
    });
    return () => socket.off("receive_code");
  }, [socket]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code on Render Server... ⏳");

    try {
      const testInput = problem?.testCases?.[0]?.input || "";
      
      const response = await axios.post("https://code-arena-backend-w7vw.onrender.com/api/compile", {
        code: code,
        language: language,
        input: testInput
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
      setOutput("Error connecting to server ❌. Server might be sleeping (Wait 30s & try again).");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-editor-wrapper">
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      {problem ? (
        <div className="question-box">
            <h3>📝 Mission: {problem.title}</h3>
            <p>{problem.description}</p>
            <div style={{fontSize: "0.85rem", color: "#aaa", marginTop: "10px", background: "#1e1e1e", padding: "10px", borderRadius: "5px"}}>
                <strong>Example Input: </strong> {problem.testCases?.[0]?.input || "N/A"} <br/>
                <strong>Expected Output: </strong> {problem.testCases?.[0]?.output || "N/A"}
            </div>
        </div>
      ) : (
        <div className="question-box"><h3>⏳ Connecting...</h3></div>
      )}

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

      <Editor height="50vh" theme="vs-dark" language={language} value={code} onChange={handleEditorChange} options={{ fontSize: 14, scrollBeyondLastLine: false }} />

      <div className="output-terminal">
        <div className="terminal-header">TERMINAL_OUTPUT &gt;</div>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;