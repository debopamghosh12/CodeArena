import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => setMessageList((list) => [...list, data]);
    socket.on("receive_message", receiveMessageHandler);
    return () => socket.off("receive_message", receiveMessageHandler);
  }, [socket]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="chat-header"><p>Live Chat 💬</p></div>
      <div className="chat-body">
        {messageList.map((msg, index) => {
          return (
            <div className="message" id={username === msg.author ? "you" : "other"} key={index}>
              <div className="message-content"><p>{msg.message}</p></div>
              <div className="message-meta"><p id="time">{msg.time}</p><p id="author">{msg.author}</p></div>
            </div>
          );
        })}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Trash talk here..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;