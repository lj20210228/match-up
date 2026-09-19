import React, { useState } from "react";
import { createMatch } from "../api/matchupApi";

const SPORTS = [
  { name: "Football", emoji: "⚽" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Tennis", emoji: "🎾" },
  { name: "Padel", emoji: "🏸" },
  { name: "Running", emoji: "🏃" },
];

export default function CreateMatchModal({ isOpen, onClose, onMatchCreated }) {
  const [sport, setSport] = useState("Football");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(44.8125);
  const [lng, setLng] = useState(20.4612);
  const [total, setTotal] = useState(10);
  const [price, setPrice] = useState(0);
  const [level, setLevel] = useState("Intermediate");
  const [levelSrb, setLevelSrb] = useState("Rekreativno");
  const [dateLabel, setDateLabel] = useState("Danas");
  const [timeRange, setTimeRange] = useState("18:00 — 19:30");
  
  const [geocoding, setGeocoding] = useState(false);
  const [showMapPin, setShowMapPin] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Besplatan OpenStreetMap Nominatim Geocoding API
  const handleGeocode = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address + ", Beograd"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
        alert("Lokacija uspešno pronađena na mapi!");
      } else {
        alert("Lokacija nije pronađena. Izaberite direktno na mapi.");
        setShowMapPin(true);
      }
    } catch {
      alert("Greška pri geokodiranju. Izaberite lokaciju na mapi.");
      setShowMapPin(true);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedSportObj = SPORTS.find((s) => s.name === sport);

    
    const matchData = {
  sport: String(sport),
  sportEmoji: selectedSportObj?.emoji || "⚽",
  timeLeft: "Uskoro",
  dateTime: new Date().toISOString(),
  dateLabel: String(dateLabel),
  timeRange: String(timeRange),
  venue: String(venue || "Lokalni teren"),
  address: String(address || "Beograd"),
  lat: Number(lat),
  lng: Number(lng),
  distance: 1.5,
  joined: 1,
  total: Number(total),
  pricePerPerson: Number(price),
  currency: "RSD",
  host: "",
  hostInitials: "",
  level: String(level),
  levelSrb: String(levelSrb),
  urgent: false,
  rules: ["Ponesite svoju opremu", "Dolazak 15min ranije"].map(String), // Garantuje niz stringova
  isMyMatch: true
};
    try {
      await createMatch(matchData);
      if (onMatchCreated) onMatchCreated();
      onClose();
    } catch (err) {
      alert(err.message || "Greška pri kreiranju meča");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-end animate-fade-in">
      <div className="bg-[#1C1C1E] border-t border-white/10 rounded-t-3xl w-full max-w-[430px] max-h-[90vh] overflow-y-auto p-5 pb-8 relative text-[#F5F5F3] scrollbar-hidden">
        
        {/* Handle bar */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-extrabold tracking-tight">Organizuj meč</h2>
          <button onClick={onClose} className="text-[#F5F5F3]/40 text-sm font-bold bg-transparent border-0 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Izbor Sporta */}
          <div>
            <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-2">Sport</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
              {SPORTS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSport(s.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                    sport === s.name
                      ? "bg-[#D4FF00] text-[#0F0F11] border-[#D4FF00]"
                      : "bg-white/5 border-white/10 text-[#F5F5F3]/60"
                  }`}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Naziv i Adresa */}
          <div>
            <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Naziv Terena</label>
            <input
              type="text"
              required
              placeholder="npr. SC OlimP ili Otvoreni teren"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Adresa / Lokacija</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="npr. Bulevar Kralja Aleksandra 10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding}
                className="bg-white/10 hover:bg-white/15 px-3 rounded-xl text-xs font-bold text-[#D4FF00] border border-white/10 cursor-pointer"
              >
                {geocoding ? "..." : "Pronađi"}
              </button>
            </div>
          </div>

          {/* Map Pinning Option */}
          <button
            type="button"
            onClick={() => setShowMapPin(!showMapPin)}
            className="text-xs text-[#D4FF00] font-semibold underline bg-transparent border-0 cursor-pointer block"
          >
            {showMapPin ? "Sakrij mapu" : "📍 Pinuje na mapi ručno"}
          </button>

          {showMapPin && (
            <div className="h-40 rounded-xl overflow-hidden border border-white/10 relative">
              <iframe
                title="Pin location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
                className="w-full h-full border-0 invert hue-rotate-180 saturate-75 brightness-75"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-[#0F0F11]/90 p-2 rounded-lg text-[10px] text-center text-[#F5F5F3]/60">
                Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
              </div>
            </div>
          )}

          {/* Igrači i Cena */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Ukupno igrača</label>
              <input
                type="number"
                min="2"
                max="30"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Cena po osobi (RSD)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
              />
            </div>
          </div>

          {/* Vreme */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Dan</label>
              <input
                type="text"
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="Danas / Sutra"
                className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#F5F5F3]/40 uppercase mb-1">Satnica</label>
              <input
                type="text"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                placeholder="18:00 — 19:30"
                className="w-full bg-[#0F0F11] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF00]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF00] text-[#0F0F11] font-extrabold text-sm py-3.5 rounded-xl cursor-pointer hover:bg-[#c2eb00] transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? "Kreiranje..." : "Objavi Meč"}
          </button>
        </form>
      </div>
    </div>
  );
}