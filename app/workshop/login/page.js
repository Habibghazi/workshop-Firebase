"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/app/lib/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  // --- 1. LOGIKA LOCKOUT (TAHAN REFRESH) ---
  useEffect(() => {
    const checkLockout = () => {
      const lockoutTimestamp = localStorage.getItem("workshop_lockout_until");
      if (lockoutTimestamp) {
        const remaining = Math.ceil((parseInt(lockoutTimestamp) - Date.now()) / 1000);
        if (remaining > 0) {
          setIsBlocked(true);
          setTimeLeft(remaining);
        } else {
          // Waktu blokir habis
          localStorage.removeItem("workshop_lockout_until");
          localStorage.removeItem("workshop_failed_attempts");
          setIsBlocked(false);
          setTimeLeft(0);
        }
      }
    };

    checkLockout(); // Cek saat pertama kali buka
    const timer = setInterval(checkLockout, 1000); // Update hitung mundur tiap detik
    return () => clearInterval(timer);
  }, []);

  // --- 2. FUNGSI PELACAKAN METADATA ---
  const getClientMetadata = async () => {
    let ipAddress = "127.0.0.1";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ipAddress = data.ip;
    } catch (e) {}

    const ua = navigator.userAgent;
    return {
      ipAddress,
      browser: ua.includes("Chrome") ? "Google Chrome" : "Other Browser",
      os: ua.includes("Win") ? "Windows" : "Other OS",
      device: /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop",
      screenRes: `${window.screen.width}x${window.screen.height}`,
      userAgent: ua
    };
  };

  const identifyAttack = (u, p) => {
    const lowerU = u.toLowerCase();
    if (/[ '";#--|*]/.test(u) || lowerU.includes("or 1=1")) return "SQL_INJECTION";
    if (/<script|javascript:|onerror=|onload=/i.test(lowerU)) return "XSS_ATTACK";
    return null;
  };

  // --- 3. HANDLER LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isBlocked || loading) return;

    setStatusMsg("");
    setLoading(true);
    const metadata = await getClientMetadata();

    // A. CEK SERANGAN INJEKSI (MINI-IDS)
    const attackType = identifyAttack(email, password);
    if (attackType) {
      setStatusMsg("Akses ditolak karena alasan keamanan.");
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

    // B. PROSES LOGIN ASLI
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // JIKA SUKSES: Bersihkan hitungan gagal
      localStorage.removeItem("workshop_failed_attempts");
      await addDoc(collection(db, "login_logs"), {
        email: email,
        status: "WORKSHOP_SUCCESS",
        ...metadata,
        timestamp: serverTimestamp(),
      });

      sessionStorage.setItem("user_session", JSON.stringify({ email }));
      router.push("/workshop/dashboard");

    } catch (authError) {
      // JIKA GAGAL: Tambah hitungan gagal di localStorage
      let attempts = parseInt(localStorage.getItem("workshop_failed_attempts") || "0");
      attempts += 1;
      localStorage.setItem("workshop_failed_attempts", attempts.toString());

      let msg = "Email atau password salah.";
      let status = "WORKSHOP_FAILED";

      // Cek apakah sudah 3 kali gagal
      if (attempts >= 3) {
        const lockUntil = Date.now() + 60000; // Lock 1 Menit (60.000 ms)
        localStorage.setItem("workshop_lockout_until", lockUntil.toString());
        setIsBlocked(true);
        msg = "Terlalu banyak percobaan. Akun dikunci selama 1 menit.";
        status = "BRUTE_FORCE_LOCKED";
      }

      await addDoc(collection(db, "login_logs"), {
        email: email,
        status: status,
        error: authError.code,
        ...metadata,
        timestamp: serverTimestamp(),
      });

      setStatusMsg(msg);
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

        {/* BANNER LOCKOUT */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-center animate-pulse">
            <p className="text-xs font-bold text-red-700 uppercase">⚠️ Akun Terkunci</p>
            <p className="text-2xl font-black text-red-600 mt-1">{timeLeft}s</p>
            <p className="text-[10px] text-red-500">Tunggu hingga waktu habis untuk mencoba lagi.</p>
          </div>
        )}

        {statusMsg && !isBlocked && (
          <div className="mb-6 p-3.5 text-xs rounded-xl border font-semibold bg-amber-50 text-amber-700 border-amber-100">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <input
            type="email"
            required
            disabled={isBlocked}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none disabled:bg-slate-100"
            placeholder="Email"
          />
          <input
            type="password"
            required
            disabled={isBlocked}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none disabled:bg-slate-100"
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}