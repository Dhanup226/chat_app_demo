import { useState, useEffect } from 'react'
import './App.css'

const ws = new WebSocket("ws://localhost:3000/cable");

function App() {
  const [message, setMessage] = useState([]);
  const [guid, setGuid] = useState("");
  const messagesContainer = document.getElementById("messages")

  ws.onopen = () => {
    console.log("Connected to websocket server");
    setGuid(Math.random().toString(36).substring(2, 15))

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: guid,
          channel: "MessagesChannel",
        }),
      })
    );
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === "ping") return;
    if (data.type === "welcome") return;
    if (data.type === "confirm_subscription") return;
    
    const message1 = data.message;
    setMessagesAndScrollDown([...message, message1]);
  };

  useEffect(() => {
    fetMessages();
  }, []);

  useEffect(() => {
    resetScroll();
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";

    await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({ body }),
    });
  };

  const fetMessages = async () => {
    const response = await fetch("http://localhost:3000/messages");
    const data = await response.json();
    setMessagesAndScrollDown(data);
  };

  const setMessagesAndScrollDown = (data) => {
    setMessage(data)
    resetScroll();
  };
  
  const resetScroll = () => {
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer. scrollHeight;
  };

  return (
    <div className='App'>
        <div className="messageHeader">
          <h1>Messages</h1>
          <p>Guid: {guid}</p>
        </div>
        <div className="messages" id="messages">
            { message.map((message) => (
              <div className="message" key={message.id}>
              <p>{message.body}</p>
            </div>
            ))}
        </div>
        <div className="messageForm">
          <form onSubmit={handleSubmit}>
            <input type="text" className="messageInput" name="message" />
            <button className="messageButton" type="submit">
              Send
            </button>
          </form>
        </div>
    </div>
  );
}

export default App