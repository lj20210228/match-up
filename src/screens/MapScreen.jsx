import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { listMatches } from "../api/matchupApi";
import "leaflet/dist/leaflet.css";

const sports = ["Svi", "Football", "Basketball", "Tennis", "Padel", "Running"];
const sportEmojis = {
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Padel: "🏸",
  Running: "🏃",
};

// Pomoćna komponenta za promenu centra mape iz React koda
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Funkcija koja generiše dinamičku HTML ikonicu sa Leaflet DivIcon-om
const createCustomIcon = (sportEmoji, venue, isSelected) => {
  const shortVenue = venue ? venue.split(" ").slice(0, 2).join(" ") : "";
  
  const html = `
    <div style="display: flex; flex-direction: column; align-items: flex-start;">
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        transition: all 0.2s ease;
        background-color: ${isSelected ? "#D4FF00" : "#0F0F11"};
        border: 2px solid ${isSelected ? "#D4FF00" : "rgba(212, 255, 0, 0.5)"};
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom-left-radius: 8px;
        box-shadow: ${isSelected ? "0 10px 15px -3px rgba(212, 255, 0, 0.4)" : "0 4px 6px -1px rgba(0, 0, 0, 0.5)"};
      ">
        <span style="font-size: 12px; line-height: 1;">${sportEmoji || "⚽"}</span>
        ${
          isSelected
            ? `<span style="font-size: 11px; font-weight: 800; color: #0F0F11; white-space: nowrap;">${shortVenue}</span>`
            : ""
        }
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${isSelected ? "#D4FF00" : "#0F0F11"};
        margin-left: auto;
        margin-right: 0;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "custom-match-marker", // Prazan class sprečava podrazumevane Leaflet stilove
    iconSize: [isSelected ? 100 : 36, 36],
    iconAnchor: [18, 36], // Sidro stavljamo na sam vrh strelice (dno pina)
  });
};

export default function MapScreen({ onMatchPress }) {
  const [activeSport, setActiveSport] = useState("Svi");
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const centerLat = 44.806;
  const centerLng = 20.465;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const sportParam = activeSport === "Svi" ? null : activeSport;

    listMatches(sportParam)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          const availableMatches = data.filter(
            (m) => m.joined < m.total && m.lat != null && m.lng != null
          );
          setMatches(availableMatches);
        }
      })
      .catch((err) => {
        console.error("Greška pri učitavanju mečeva za mapu:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSport]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-[#0F0F11]">
      {/* Pravi Leaflet prikaz mape */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full border-0 invert hue-rotate-180 saturate-75 brightness-75"
        >
          <ChangeView center={[centerLat, centerLng]} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Renderovanje pinova direktno na Leaflet mapi */}
          {matches.map((match) => {
            const isSelected = selectedMatch?.id === match.id;
            return (
              <Marker
                key={match.id}
                position={[match.lat, match.lng]}
                icon={createCustomIcon(match.sportEmoji, match.venue, isSelected)}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedMatch(isSelected ? null : match);
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Indikator učitavanja */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F11]/40 backdrop-blur-xs z-20 pointer-events-none">
          <span className="text-xs font-semibold text-[#D4FF00] bg-[#0F0F11]/80 px-4 py-2 rounded-full border border-white/10">
            Učitavanje mečeva na mapi...
          </span>
        </div>
      )}

      {/* Gornji filteri */}
      <div className="relative z-30 pt-[calc(env(safe-area-inset-top)+0.75rem)] pointer-events-none">
        <div className="px-5 pb-3 bg-gradient-to-b from-[#0F0F11]/90 via-[#0F0F11]/60 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold text-[#F5F5F3] tracking-tight m-0">
                Mečevi u blizini
              </h1>
              <div className="text-xs text-[#F5F5F3]/40 mt-0.5">
                {matches.length} dostupnih mečeva
              </div>
            </div>
            <div className="bg-[#0F0F11]/80 border border-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
              <span className="text-xs font-semibold text-[#F5F5F3]/70">Beograd</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/10 backdrop-blur-md transition-all cursor-pointer ${
                  activeSport === sport
                    ? "bg-[#D4FF00] text-[#0F0F11] border-[#D4FF00]"
                    : "bg-[#0F0F11]/75 text-[#F5F5F3]/65"
                }`}
              >
                {sport !== "Svi" && <span className="text-xs">{sportEmojis[sport]}</span>}
                {sport}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kartica izabranog meča */}
      {selectedMatch && (
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11]/90 to-transparent">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
            <div className="w-11.5 h-11.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
              {selectedMatch.sportEmoji || "⚽"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#F5F5F3] tracking-tight mb-0.5 truncate">
                {selectedMatch.venue}
              </div>
              <div className="text-xs text-[#F5F5F3]/40 mb-1.5">
                {selectedMatch.timeLeft} · {selectedMatch.distance} km
              </div>
              <div className="bg-white/10 rounded-full h-1">
                <div
                  className="bg-[#D4FF00] rounded-full h-1"
                  style={{
                    width: `${Math.min(100, (selectedMatch.joined / selectedMatch.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => {
                onMatchPress(selectedMatch);
                setSelectedMatch(null);
              }}
              className="bg-[#D4FF00] text-[#0F0F11] font-extrabold rounded-full px-4.5 py-2.5 text-xs shrink-0 cursor-pointer hover:bg-[#c2eb00] transition-colors"
            >
              Otvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
}