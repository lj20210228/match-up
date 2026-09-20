import React, { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createMatch } from "../api/matchupApi";

const SPORTS = [
  { name: "Football", emoji: "⚽" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Tennis", emoji: "🎾" },
  { name: "Padel", emoji: "🏸" },
  { name: "Running", emoji: "🏃" },
];

const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateLabel = (dateValue) => {
  const selectedDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (selectedDate.getTime() === today.getTime()) return "Danas";
  if (selectedDate.getTime() === tomorrow.getTime()) return "Sutra";

  return selectedDate.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function MapClickHandler({ onPickLocation }) {
  const map = useMapEvents({
    click(event) {
      onPickLocation(event.latlng.lat, event.latlng.lng);
      map.flyTo(event.latlng, Math.max(map.getZoom(), 15), {
        duration: 0.45,
      });
    },
  });

  return null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 15), {
      duration: 0.45,
    });
  }, [map, position[0], position[1]]);

  return null;
}

export default function CreateMatchModal({
  isOpen,
  onClose,
  onMatchCreated,
}) {
  const [sport, setSport] = useState("Football");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");

  const [lat, setLat] = useState(44.8125);
  const [lng, setLng] = useState(20.4612);
const [pinSelected, setPinSelected] = useState(false);
  const [total, setTotal] = useState(10);
  const [price, setPrice] = useState(0);
  const [level, setLevel] = useState("Intermediate");
  const [levelSrb, setLevelSrb] = useState("Rekreativno");

  const [matchDate, setMatchDate] = useState(getLocalDateInputValue());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");

  const [geocoding, setGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const selectLocation = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
setPinSelected(true);
  };

  const handleGeocode = async () => {
    if (!address.trim()) {
      alert("Prvo unesite adresu.");
      return;
    }

    setGeocoding(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${address}, Beograd`
        )}`
      );

      const data = await response.json();

      if (data?.length > 0) {
        setLat(Number(data[0].lat));
        setLng(Number(data[0].lon));
        setPinSelected(true);
      } else {
        alert("Lokacija nije pronađena. Kliknite na mapu da ručno postavite pin.");
      }
    } catch {
      alert("Greška pri pretrazi. Kliknite na mapu da ručno postavite pin.");
    } finally {
      setGeocoding(false);
    }
  };

  const confirmLocation = () => {
    setLocationConfirmed(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pinSelected) {
  alert("Kliknite na mapu ili pretražite adresu da postavite lokaciju meča.");
  return;
}

    if (endTime <= startTime) {
      alert("Vreme završetka mora biti nakon vremena početka.");
      return;
    }

    setLoading(true);

    const selectedSport = SPORTS.find((item) => item.name === sport);
    const dateLabel = getDateLabel(matchDate);

    const matchData = {
      sport,
      sportEmoji: selectedSport?.emoji ?? "⚽",
      dateTime: `${matchDate}T${startTime}:00`,
      dateLabel,
      timeRange: `${startTime} — ${endTime}`,
      venue: venue || "Lokalni teren",
      address: address.trim() || "Lokacija izabrana na mapi",
      lat: Number(lat),
      lng: Number(lng),
      total: Number(total),
      pricePerPerson: Number(price),

      timeLeft: "Uskoro",
      distance: 1.5,
      currency: "RSD",
      level,
      levelSrb,
      urgent: false,
      rules: ["Ponesite svoju opremu", "Dolazak 15 min ranije"],
    };

    try {
      await createMatch(matchData);
      onMatchCreated?.();
      onClose();
    } catch (error) {
      alert(error.message || "Greška pri kreiranju meča");
    } finally {
      setLoading(false);
    }
  };

  const pinPosition = [lat, lng];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end justify-center animate-fade-in">
<div className="mb-[72px] w-full max-w-[430px] max-h-[calc(92vh-72px)] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-[#18181B] p-5 pb-8 text-[#F5F5F3] shadow-2xl scrollbar-hidden">        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4FF00]">
              Novi termin
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              Organizuj meč
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
       <section>
            <label className="mb-2 block text-[11px] font-semibold uppercase text-white/40">
              Sport
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
              {SPORTS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSport(item.name)}
                  className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                    sport === item.name
                      ? "border-[#D4FF00] bg-[#D4FF00] text-[#101011] shadow-[0_0_18px_rgba(212,255,0,0.18)]"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {item.emoji} {item.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-xs font-bold text-white/80">Termin</p>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase text-white/40">
                Datum meča
              </label>

              <input
                type="date"
                required
                min={getLocalDateInputValue()}
                value={matchDate}
                onChange={(event) => setMatchDate(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-sm outline-none transition focus:border-[#D4FF00]"
              />

              <p className="mt-2 text-xs font-semibold text-[#D4FF00]">
                {getDateLabel(matchDate)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-white/40">
                  Početak
                </label>

                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-sm outline-none transition focus:border-[#D4FF00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-white/40">
                  Kraj
                </label>

                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-sm outline-none transition focus:border-[#D4FF00]"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-white/40">
                Naziv terena
              </label>

              <input
                type="text"
                required
                placeholder="npr. SC Olimp"
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-xs outline-none transition focus:border-[#D4FF00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-white/40">
                Adresa
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="npr. Bulevar kralja Aleksandra 10"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-xs outline-none transition focus:border-[#D4FF00]"
                />

                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className="rounded-xl border border-[#D4FF00]/30 bg-[#D4FF00]/10 px-3 text-xs font-bold text-[#D4FF00] transition hover:bg-[#D4FF00]/20 disabled:opacity-50"
                >
                  {geocoding ? "..." : "Pronađi"}
                </button>
              </div>
            </div>

           <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101011]">
  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
    <div>
      <p className="text-xs font-bold">Lokacija na mapi</p>
      <p className="mt-0.5 text-[10px] text-white/40">
        Klikni na mapu da postaviš ili pomeriš pin.
      </p>
    </div>

    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        pinSelected
          ? "bg-[#D4FF00]/15 text-[#D4FF00]"
          : "bg-amber-400/10 text-amber-300"
      }`}
    >
      {pinSelected ? "✓ Pin postavljen" : "Pin je obavezan"}
    </span>
  </div>

  <MapContainer
    center={pinPosition}
    zoom={14}
    scrollWheelZoom
    className="h-64 w-full"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <MapClickHandler onPickLocation={selectLocation} />
    <RecenterMap position={pinPosition} />

    <CircleMarker
      center={pinPosition}
      radius={12}
      pathOptions={{
        color: "#D4FF00",
        fillColor: "#D4FF00",
        fillOpacity: 0.9,
        weight: 3,
      }}
    >
      <Popup>
        <strong>Lokacija meča</strong>
        <br />
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </Popup>
    </CircleMarker>
  </MapContainer>

  <div className="px-4 py-3 text-[10px] text-white/40">
    Koordinate: {lat.toFixed(5)}, {lng.toFixed(5)}
  </div>
</div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-white/40">
                Ukupno igrača
              </label>

              <input
                type="number"
                min="2"
                max="30"
                value={total}
                onChange={(event) => setTotal(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-xs outline-none transition focus:border-[#D4FF00]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-white/40">
                Cena po osobi
              </label>

              <input
                type="number"
                min="0"
                step="50"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F0F11] px-4 py-3 text-xs outline-none transition focus:border-[#D4FF00]"
              />
            </div>
          </section>
           <button
    type="submit"
    disabled={loading}
    className="mt-6 w-full rounded-2xl bg-[#D4FF00] py-4 text-sm font-black text-[#101011] shadow-[0_8px_25px_rgba(212,255,0,0.16)] transition hover:bg-[#C3ED00] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {loading ? "Kreiranje meča..." : "Objavi meč"}
  </button>
        </form>
          
      </div>
    
    </div>
  );
}