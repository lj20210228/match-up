



//const BASE = "http://localhost:8080";
const BASE =   import.meta.env.VITE_API_URL;


export const request = async (method, endpoint, body = null) => {
  const token = localStorage.getItem("matchup_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE}/api${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
      errorData.message ||
      "Greška na serveru"
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// ── AUTH ─────────────────────────────────────────────────────────────────────

export const register = (data) => request("POST", "/auth/register", data);
export const login = (data) => request("POST", "/auth/login", data);
export const getMe = () => request("GET", "/users/me");
export const updateMe = (data) => request("PATCH", "/users/me", data);
export const logout = () => {
  localStorage.removeItem("matchup_token");
};

// ── MATCHES ──────────────────────────────────────────────────────────────────

export const listMatches = (filters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  return request("GET", `/matches?${params}`);
};

export const getMatch = (id) => request("GET", `/matches/${id}`);
export const createMatch = (data) => request("POST", "/matches", data);
export const joinMatch = (id) => request("POST", `/matches/${id}/join`);
export const leaveMatch = (id) => request("DELETE", `/matches/${id}/join`);
export const getMyMatches = (tab = "joined") => request("GET", `/matches/mine?tab=${tab}`);
export const getMatchesNearby = (lat, lng, radius_km = 10, sport) =>
  listMatches({ lat, lng, radius_km, sport });
export const getMatchPlayers = (matchId) => request("GET", `/matches/${matchId}/players`);

// ── CHAT ─────────────────────────────────────────────────────────────────────

export const listChats = () => request("GET", "/chats");
export const getChatMessages = (chatId, page = 1, limit = 50) =>
  request("GET", `/chats/${chatId}/messages?page=${page}&limit=${limit}`);
export const sendMessage = (chatId, text) =>
  request("POST", `/chats/${chatId}/messages`, { text });
export const markChatRead = (chatId) =>
  request("POST", `/chats/${chatId}/read`);

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const listNotifications = () => request("GET", "/notifications");
export const markAllNotificationsRead = () => request("POST", "/notifications/read-all");

// ── SPORTS & VENUES ──────────────────────────────────────────────────────────

export const SUPPORTED_SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Padel",
  "Running",
  "Volleyball",
  "Badminton",
  "Table Tennis",
];

export const searchVenues = (query, city) => {
  const params = new URLSearchParams({ q: query });
  if (city) params.set("city", city);
  return request("GET", `/venues?${params}`);
};