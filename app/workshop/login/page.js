"use client";

import { useState } from "react";
import { db, auth } from "@/app/lib/firebase"; // Pastikan auth diimport
import { signInWithEmailAndPassword } from "firebase/auth"; // Fungsi asli Firebase
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- 1. FUNGSI PELACAKAN (IP, LOKASI, PERANGKAT) ---
  const getLocation = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        resolve({ lat: "N/A", lng: "N/A" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
        () => resolve({ lat: "Denied", lng: "Denied" }),
        { timeout: 5000 }
      );
    });
  };

  const getClientMetadata = async () => {
    let ipAddress = "127.0.0.1";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ipAddress = data.ip;
    } catch (e) {}

    const coords = await getLocation();
    const ua = typeof window !== "undefined" ? navigator.userAgent : "";
    
    return {
      ipAddress,
      location: `${coords.lat}, ${coords.lng}`,
      browser: ua.includes("Chrome") ? "Google Chrome" : "Other Browser",
      os: ua.includes("Win") ? "Windows" : "Other OS",
      device: /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop",
      screenRes: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "N/A",
      userAgent: ua
    };
  };

  // --- 2. LOGIKA DETEKSI SERANGAN (MINI-IDS) ---
  const identifyAttack = (u, p) => {
    const lowerU = u.toLowerCase();
    const lowerP = p.toLowerCase();
    if (/[ '";#--|*]/.test(u) || lowerU.includes("or 1=1") || lowerP.includes("or 1=1")) return "SQL_INJECTION";
    if (/<script|javascript:|onerror=|onload=/i.test(lowerU) || /<script|javascript:|onerror=|onload=/i.test(lowerP)) return "XSS_ATTACK";
    return null;
  };

  // --- 3. HANDLER LOGIN (REAL AUTH) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading || isBlocked) return;

    setStatusMsg("");
    setLoading(true);

    try {
      const metadata = await getClientMetadata();
      const attackType = identifyAttack(email, password);

      // A. CEK SERANGAN (MINI-IDS)
      if (attackType) {
        setStatusMsg("Akses ditolak karena alasan keamanan.");
        setIsBlocked(true);
        await addDoc(collection(db, "login_logs"), {
          email: email || "Unknown Attacker",
          status: "CRITICAL_ATTACK",
          attackType: attackType,
          ...metadata,
          timestamp: serverTimestamp(),
        });
        setLoading(false);
        return;
      }

      // B. PROSES LOGIN ASLI KE FIREBASE AUTH
      try {
        await signInWithEmailAndPassword(auth, email, password);
        
        // Jika Berhasil: Catat Log Sukses
        await addDoc(collection(db, "login_logs"), {
          email: email,
          status: "WORKSHOP_SUCCESS",
          ...metadata,
          timestamp: serverTimestamp(),
        });

        // Simpan sesi lokal dan pindah halaman
        sessionStorage.setItem("user_session", JSON.stringify({ email }));
        router.push("/workshop/dashboard");

      } catch (authError) {
        // Jika Gagal: Catat Log Gagal
        let errorMsg = "Email atau password salah.";
        if (authError.code === "auth/too-many-requests") {
          errorMsg = "Terlalu banyak percobaan. Akun diblokir sementara.";
          setIsBlocked(true);
        }

        await addDoc(collection(db, "login_logs"), {
          email: email,
          status: "WORKSHOP_FAILED",
          error: authError.code,
          ...metadata,
          timestamp: serverTimestamp(),
        });
        setStatusMsg(errorMsg);
      }

    } catch (err) {
      setStatusMsg("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white p-8 sm:p-10 relative overflow-hidden">
        
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Sign In</h1>
          <p className="text-sm text-slate-500 mt-2">Silakan masuk dengan akun terdaftar Anda.</p>
        </div>

        {statusMsg && (
          <div className={`mb-6 p-3.5 text-xs rounded-xl border font-semibold ${isBlocked ? 'bg-red-50 text-red-700 border-red-100 animate-bounce' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              disabled={isBlocked}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              placeholder="user@workshop.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              disabled={isBlocked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6 relative z-10">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Real-time Auth Enabled
          </p>
        </div>
      </div>
    </main>
  );
}