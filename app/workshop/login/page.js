"use client";
import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function WorkshopLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulasi Mini-IDS (Deteksi Anomali Karakter Berbahaya)
  const checkMiniIDS = (input) => {
    const maliciousPattern = /['";#--\/\*|<>]|script|SELECT|DROP/i;
    return maliciousPattern.test(input);
  };

  // Fungsi untuk mengambil metadata pendukung (IP, Browser, Perangkat)
  const getClientMetadata = async () => {
    let ipAddress = "127.0.0.1 (Local)";
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ipAddress = data.ip;
    } catch (error) {
      console.warn("Gagal mendeteksi IP publik:", error);
    }

    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Edge")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    else if (ua.includes("Safari")) browser = "Apple Safari";

    let deviceType = "Desktop / PC";
    if (/android/i.test(ua)) deviceType = "Android Mobile";
    else if (/iphone|ipad|ipod/i.test(ua)) deviceType = "iOS Device";

    return {
      ipAddress,
      browser,
      device: deviceType,
      userAgent: ua,
    };
  };

  const handleWorkshopLogin = async (e) => {
    e.preventDefault();
    setStatusMsg("");

    // Kumpulkan metadata perangkat & jaringan saat tombol ditekan
    const metadata = await getClientMetadata();

    // Cek Mini-IDS sebelum kirim ke database
    if (checkMiniIDS(email) || checkMiniIDS(password)) {
      setStatusMsg("⚠️ Mini-IDS Alert: Karakter atau payload berbahaya terdeteksi! Akses diblokir.");
      setIsBlocked(true);
      
      try {
        await addDoc(collection(db, "login_logs"), {
          email: email || "unknown",
          status: "MINI_IDS_BLOCKED",
          ipAddress: metadata.ipAddress,
          browser: metadata.browser,
          device: metadata.device,
          userAgent: metadata.userAgent,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setLoading(true);

    try {
      if (password.length >= 6) {
        setStatusMsg("✅ Berhasil Masuk! Sesi workshop aktif.");
        await addDoc(collection(db, "login_logs"), {
          email: email,
          status: "WORKSHOP_SUCCESS",
          ipAddress: metadata.ipAddress,
          browser: metadata.browser,
          device: metadata.device,
          userAgent: metadata.userAgent,
          timestamp: serverTimestamp(),
        });
      } else {
        setStatusMsg("❌ Gagal Masuk: Sandi terlalu pendek atau salah.");
        await addDoc(collection(db, "login_logs"), {
          email: email,
          status: "WORKSHOP_FAILED",
          error: "Invalid password length in simulation",
          ipAddress: metadata.ipAddress,
          browser: metadata.browser,
          device: metadata.device,
          userAgent: metadata.userAgent,
          timestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      setStatusMsg("❌ Gagal Masuk: Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            Uji Coba Peserta
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Workshop Login Test</h1>
          <p className="text-sm text-gray-500 mt-1">Simulasi keamanan & pencatatan log real-time</p>
        </div>

        {statusMsg && (
          <div className={`mb-4 p-3 text-sm rounded-lg border ${isBlocked || statusMsg.includes("❌") ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleWorkshopLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Peserta</label>
            <input
              type="email"
              required
              disabled={isBlocked}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
              placeholder="peserta@workshop.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sandi</label>
            <input
              type="password"
              required
              disabled={isBlocked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Uji Coba Login"}
          </button>
        </form>
      </div>
    </main>
  );
}