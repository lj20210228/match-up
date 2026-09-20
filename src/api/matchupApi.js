const BASE = import.meta.env.VITE_API_URL
// Bez Markdown linka — mora biti običan string.
//const BASE = "http://localhost:8080";

export const request = async (method, endpoint, body = null) => {
  const token = localStorage.getItem("matchup_token");

  const headers = {
    "Content-Type": "application/json",
  };

  // Login i register nemaju token; za ostale zahteve se šalje automatski.
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

  // Ako neka ruta vraća prazan odgovor, neće baciti grešku.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const register = (data) =>
  request("POST", "/auth/register", data);

export const login = (data) =>
  request("POST", "/auth/login", data);

export const getMe = () =>
  request("GET", "/users/me");

export const updateMe = (data) =>
  request("PATCH", "/users/me", data);

export const logout = () => {
  localStorage.removeItem("matchup_token");
};

// ── MATCHES ──────────────────────────────────────────────────────────────────

/** List all available matches (explore feed). */
export const listMatches = (filters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
  }
  return request("GET", `/matches?${params}`);
};

/** Get a single match with full detail. */
export const getMatch = (id) => request("GET", `/matches/${id}`);

/** Create a new match. */
export const createMatch = (data) => request("POST", "/matches", data);

/** Join an existing match. */
export const joinMatch = (id) => request("POST", `/matches/${id}/join`);

/** Leave a match. */
export const leaveMatch = (id) => request("DELETE", `/matches/${id}/join`);

/** Get all matches the current user has joined or created. */
export const getMyMatches = (tab = "joined") => request("GET", `/matches/mine?tab=${tab}`);
/** Get matches near a geo point (for map view). */
export const getMatchesNearby = (lat, lng, radius_km = 10, sport) =>
  listMatches({ lat, lng, radius_km, sport });
/** Get all confirmed players for a specific match. */
export const getMatchPlayers = (matchId) => request("GET", `/matches/${matchId}/players`);

// ── CHAT ─────────────────────────────────────────────────────────────────────

/** List all chat rooms the current user is in. */
export const listChats = () => request("GET", "/chats");

/** Get all messages for a chat (paginated). */
export const getChatMessages = (chatId, page = 1, limit = 50) =>
  request("GET", `/chats/${chatId}/messages?page=${page}&limit=${limit}`);

/** Send a message. */
export const sendMessage = (chatId, text) =>
  request("POST", `/chats/${chatId}/messages`, { text });

/** Mark a chat as read. */
export const markChatRead = (chatId) =>
  request("POST", `/chats/${chatId}/read`);

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────

/** List notifications for the current user. */
export const listNotifications = () => request("GET", "/notifications");

/** Mark all notifications read. */
export const markAllNotificationsRead = () =>
  request("POST", "/notifications/read-all");

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

/** Search venues by name or city. */
export const searchVenues = (query, city) => {
  const params = new URLSearchParams({ q: query });
  if (city) params.set("city", city);
  return request("GET", `/venues?${params}`);
};