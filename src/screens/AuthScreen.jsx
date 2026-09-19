import React, { useState } from "react";
import { login, register } from "../api/matchupApi"; // Prilagodi putanju do tvog API fajla

export default function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Beograd");

  // Statusi za komunikaciju sa backendom
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await login({ email, password });
      } else {
        response = await register({ name, email, password, city });
      }

      // Sačuvaj token za buduće API zahteve
      if (response.token) {
        localStorage.setItem("matchup_token", response.token);
      }

      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || "Došlo je do greške. Proverite podatke.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between overflow-y-auto bg-[#0F0F11] px-6 pt-14 pb-8 scrollbar-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#D4FF00] flex items-center justify-center font-black text-black text-xl">
            M
          </div>
          <span className="text-2xl font-black text-[#F5F5F3] tracking-tight">
            Match<span className="text-[#D4FF00]">Up</span>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#F5F5F3] tracking-tight mb-2">
          {isLogin ? "Dobrodošli nazad" : "Kreirajte nalog"}
        </h1>
        <p className="text-xs text-[#F5F5F3]/40 font-normal mb-8">
          {isLogin
            ? "Prijavite se da pronađete termine i mečeve u blizini."
            : "Pridružite se zajednici i nađite saigrače za sport u vašem gradu."}
        </p>

        {/* Prikaz greške iz Ktor backenda */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/40 mb-1.5 pl-1">
                Ime i Prezime
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Marko Marković"
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-[#F5F5F3] placeholder-[#F5F5F3]/25 outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/40 mb-1.5 pl-1">
              Email Adresa
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vasiemail@domain.com"
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-[#F5F5F3] placeholder-[#F5F5F3]/25 outline-none focus:border-[#D4FF00] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/40 mb-1.5 pl-1">
              Lozinka
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-[#F5F5F3] placeholder-[#F5F5F3]/25 outline-none focus:border-[#D4FF00] transition-colors"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/40 mb-1.5 pl-1">
                Grad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-[#F5F5F3] outline-none focus:border-[#D4FF00] transition-colors"
              >
                <option value="Beograd">Beograd</option>
                <option value="Novi Sad">Novi Sad</option>
                <option value="Niš">Niš</option>
                <option value="Kragujevac">Kragujevac</option>
                <option value="Požega">Požega</option>
              </select>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-[11px] text-[#D4FF00] font-semibold bg-transparent border-none cursor-pointer"
              >
                Zaboravili ste lozinku?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF00] text-[#0F0F11] font-extrabold text-sm py-3.5 rounded-xl cursor-pointer hover:bg-[#c2eb00] transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? "Učitavanje..." : isLogin ? "Prijavi se" : "Registruj se"}
          </button>
        </form>
      </div>

      {/* Prebacivanje između Prijave i Registracije */}
      <div className="text-center pt-6 border-t border-white/5 mt-6">
        <p className="text-xs text-[#F5F5F3]/40 m-0">
          {isLogin ? "Nemate nalog?" : "Već imate nalog?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[#D4FF00] font-bold bg-transparent border-none cursor-pointer ml-1"
          >
            {isLogin ? "Registrujte se" : "Prijavite se"}
          </button>
        </p>
      </div>
    </div>
  );
}