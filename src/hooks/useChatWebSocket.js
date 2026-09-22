import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export function useChatWebSocket(chatId) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // 1. Učitavanje istorije poruka preko REST API-ja
  useEffect(() => {
    if (!chatId) return;

    const token = localStorage.getItem("matchup_token");
    fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Greška pri učitavanju poruka:", err));
  }, [chatId]);

  // 2. Konekcija na WebSocket za real-time poruke
  useEffect(() => {
    if (!chatId) return;

    const token = localStorage.getItem("matchup_token");
    if (!token || token === "null") {
      console.warn("WebSocket otkazan: matchup_token nije pronađen u localStorage.");
      return;
    }

    const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
    const cleanHost = API_BASE.replace(/^https?:\/\//, "");
    
    // Putanja prebačena na /api/chats/ws/${chatId}
    const wsUrl = `${wsProtocol}://${cleanHost}/api/chats/ws/${chatId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        
        // Prevencija dupliranja poruka u UI stanju
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      } catch (e) {
        console.error("Greška pri parsiranju WS poruke:", e);
      }
    };

    ws.onerror = (err) => console.error("WebSocket Greška:", err);
    ws.onclose = () => setIsConnected(false);

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [chatId]);

  const sendMessage = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text);
    } else {
      console.warn("WebSocket nije otvoren. Poruka nije poslata.");
    }
  };

  return { messages, sendMessage, isConnected };
}