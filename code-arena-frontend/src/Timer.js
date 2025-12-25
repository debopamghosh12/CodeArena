import React, { useState, useEffect } from "react";

function Timer({ startTime }) {
  const TOTAL_TIME = 20 * 60 * 1000; // 20 Minutes
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - startTime;
      const remaining = TOTAL_TIME - timePassed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div style={{ 
        background: timeLeft < 60000 ? "#da3633" : "#0d1117", 
        color: timeLeft < 60000 ? "white" : "#2ea043",
        padding: "5px 15px", 
        borderRadius: "5px", 
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: "18px",
        border: "1px solid #30363d"
    }}>
      ⏳ {formatTime(timeLeft)}
    </div>
  );
}

export default Timer;