import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Confetti from "react-confetti";

function CodeEditor({ socket, roomId, problem }) {
  const [code, setCode] = useState("// Write your solution here...");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("javascript");
  
  const [isWinner, setIsWinner] = useState(false);
  const [status, setStatus] = useState(""); 

  const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    python: "3.10.0",
    java: "15.0.2",
    c: "10.2.0",
    cpp: "10.2.0",
  };

  useEffect(() => {
    socket.on("receive_code", (data) => setCode(data.code));
  }, [socket]);

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("send_code", { code: value, room: roomId });
  };

  const runCode = async () => {
    setIsLoading(true);
    setStatus(""); 
    setOutput("Running tests...");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: LANGUAGE_VERSIONS[language],
          files: [{ content: code }],
        }),
      });
      const data = await response.json();
      
      const runOutput = data.run ? data.run.output.trim() : ""; 
      setOutput(runOutput);

      // --- JUDGE LOGIC ---
      if (problem) {
        const expected = problem.testCases[0].output.trim();
        if (runOutput === expected) {
            setStatus("✅ PASSED! YOU WON!");
            setIsWinner(true);
        } else {
            setStatus(`❌ FAILED. Expected: "${expected}"`);
            setIsWinner(false);
        }
      }
    } catch (error) {
      setOutput("Failed to run code: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      
      {/* CONFETTI EXPLOSION */}
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Problem Header */}
      <div style={{ padding: "15px", background: "#161b22", color: "white", borderBottom: "1px solid #30363d" }}>
        <h3 style={{ margin: "0 0 5px 0", color: "#2ea043" }}>Mission: {problem ? problem.title : "Loading..."}</h3>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>{problem ? problem.description : "Wait for instructions..."}</p>
      </div>

      {/* Control Bar */}
      <div className="top-bar" style={{ background: "#1e1e1e", borderBottom: "none" }}>
        <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
        </select>

        <span style={{ marginLeft: "15px", fontWeight: "bold", color: isWinner ? "#2ea043" : "#da3633" }}>{status}</span>

        <button className="btn-run" onClick={runCode} disabled={isLoading}>
            {isLoading ? "Running..." : "▶ Submit Solution"}
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language === "c" || language === "cpp" ? "cpp" : language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{ fontSize: 16, minimap: { enabled: false } }}
        />
      </div>

      {/* Output */}
      <div className="output-terminal">
        <h4 style={{ margin: "0 0 10px 0", color: "#888" }}>TERMINAL_OUTPUT &gt;</h4>
        <pre style={{ margin: 0 }}>{output}</pre>
      </div>
    </div>
  );
}

export default CodeEditor;