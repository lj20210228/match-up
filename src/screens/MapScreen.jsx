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

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

const createCustomIcon = (sportEmoji, venue, isSelected) => {
  const shortVenue = venue ? venue.split(" ").slice(0, 2).join(" ") : "";

  const html = `
    <div style="display:flex;flex-direction:column;align-items:flex-start;">
      <div style="
        display:flex;
        align-items:center;
        gap:5px;
        padding:5px 10px;
        background:${isSelected ? "#D4FF00" : "#171719"};
        border:1px solid ${isSelected ? "#D4FF00" : "rgba(212,255,0,.55)"};
        border-radius:10px;
        box-shadow:${isSelected
          ? "0 8px 24px rgba(212,255,0,.28)"
          : "0 4px 12px rgba(0,0,0,.35)"};
        transition:all .2s ease;
      ">
        <span style="font-size:13px;line-height:1;">${sportEmoji || "⚽"}</span>
        ${
          isSelected
            ? `<span style="font-size:11px;font-weight:800;color:#111;white-space:nowrap;">${shortVenue}</span>`
            : ""
        }
      </div>
      <div style="
        width:0;
        height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:6px solid ${isSelected ? "#D4FF00" : "#171719"};
        margin-left:12px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-match-marker",
    iconSize: [isSelected ? 110 : 38, 38],
    iconAnchor: [18, 38],
  });
};

export default function MapScreen({ onMatchPress }) {
  const [activeSport, setActiveSport] = useState("Svi");
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const center = [44.806, 20.465];

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    const sportParam = activeSport === "Svi" ? null : activeSport;

    listMatches(sportParam)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          const availableMatches = data.filter(
            (match) =>
              match.joined < match.total &&
              match.lat != null &&
              match.lng != null
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
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F0F11]">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          className="h-full w-full border-0 invert hue-rotate-180 saturate-75 brightness-75"
        >
          <ChangeView center={center} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {matches.map((match) => {
            const isSelected = selectedMatch?.id === match.id;

            return (
              <Marker
                key={match.id}
                position={[match.lat, match.lng]}
                icon={createCustomIcon(
                  match.sportEmoji,
                  match.venue,
                  isSelected
                )}
                eventHandlers={{
                  click: (event) => {
                    L.DomEvent.stopPropagation(event);
                    setSelectedMatch(isSelected ? null : match);
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#0F0F11]/30 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/10 bg-[#171719]/90 px-4 py-2 text-xs font-semibold text-[#D4FF00] shadow-lg">
            Učitavanje mečeva na mapi...
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-30 px-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="pointer-events-auto mx-auto max-w-xl">
          <div className="rounded-[22px] border border-white/10 bg-[#111113]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4FF00] shadow-[0_0_12px_rgba(212,255,0,.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4FF00]/80">
                    Beograd · uživo
                  </span>
                </div>

                <h1 className="m-0 text-[21px] font-extrabold leading-tight tracking-tight text-[#F5F5F3]">
                  Mečevi u blizini
                </h1>

                <p className="m-0 mt-1 text-xs text-[#F5F5F3]/50">
                  {matches.length}{" "}
                  {matches.length === 1
                    ? "dostupan meč"
                    : "dostupnih mečeva"}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4FF00]/20 bg-[#D4FF00]/10 text-xl">
                📍
              </div>
            </div>

            <div className="my-4 h-px bg-white/[0.08]" />

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sports.map((sport) => {
                const isActive = activeSport === sport;

                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setActiveSport(sport)}
                    aria-pressed={isActive}
                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "border-[#D4FF00] bg-[#D4FF00] text-[#111113]"
                        : "border-white/10 bg-white/[0.04] text-[#F5F5F3]/70 hover:bg-white/[0.09]"
                    }`}
                  >
                    {sport !== "Svi" && (
                      <span aria-hidden="true">{sportEmojis[sport]}</span>
                    )}
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedMatch && (
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-[22px] border border-white/10 bg-[#171719]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl">
              {selectedMatch.sportEmoji || "⚽"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 truncate text-sm font-bold tracking-tight text-[#F5F5F3]">
                {selectedMatch.venue}
              </div>

              <div className="mb-2 text-xs text-[#F5F5F3]/50">
                {selectedMatch.timeLeft} · {selectedMatch.distance} km
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#D4FF00]"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedMatch.joined / selectedMatch.total) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onMatchPress(selectedMatch);
                setSelectedMatch(null);
              }}
              className="shrink-0 cursor-pointer rounded-full bg-[#D4FF00] px-4 py-2.5 text-xs font-extrabold text-[#111113] transition-colors hover:bg-[#c2eb00]"
            >
              Otvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
}