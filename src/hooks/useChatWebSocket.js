import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export function useChatWebSocket(matchId) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // 1. Učitavanje istorije poruka preko REST API-ja
  useEffect(() => {
    if (!matchId) return;

    const token = localStorage.getItem("matchup_token");
    fetch(`${API_BASE}/api/chats/${matchId}/messages`, {
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
  }, [matchId]);

  // 2. Konekcija na WebSocket za real-time poruke
  useEffect(() => {
    if (!matchId) return;

    const token = localStorage.getItem("matchup_token");
    if (!token || token === "null") {
      console.warn("WebSocket otkazan: matchup_token nije pronađen u localStorage.");
      return;
    }

    const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
    const cleanHost = API_BASE.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${cleanHost}/api/chats/${matchId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMessage]);
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
  }, [matchId]);

  const sendMessage = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text);
    }
  };

  return { messages, sendMessage, isConnected };
}