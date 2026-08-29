"use client";
import { useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const ShieldIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043A3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296A3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043A3.746 3.746 0 0 1 21 12Z" />
  </svg>
);

export default function AdminPortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInEmail = userCredential.user.email;

      const q = query(collection(db, "admin_whitelist"), where("email", "==", loggedInEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await signOut(auth);
        setError("Akses ditolak: Akun ini tidak terdaftar sebagai administrator sistem.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "admin_audit_logs"), {
        email: loggedInEmail,
        status: "ADMIN_LOGIN_SUCCESS",
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Otorisasi ditolak. Periksa kembali email dan password Anda.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-[1000px] w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/80">
        
        {/* PANEL KIRI: BRANDING DENGAN GLOW */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 p-12 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-8 shadow-inner border border-white/20">
              <ShieldIcon />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-white leading-tight">
              LoginShield<span className="text-blue-400">.</span>
            </h1>
            <p className="text-blue-200/80 text-sm leading-relaxed max-w-sm font-medium">
              Enterprise Identity & Access Management. Portal masuk eksklusif untuk administrator sistem monitoring workshop.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10">
            <p className="text-xs text-blue-200/70 font-medium">
              Sistem aktif terhubung ke database cloud secara real-time.
            </p>
          </div>
        </div>

        {/* PANEL KANAN: FORM LOGIN */}
        <div className="md:w-7/12 p-10 md:p-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-[360px]">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Administrator Portal
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Masukkan kredensial akses untuk masuk ke command center.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-xs text-red-700 bg-red-50/80 rounded-2xl border border-red-100 font-semibold flex items-start gap-3 shadow-sm shadow-red-500/5">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Account / Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium shadow-inner"
                  placeholder="admin@workshop.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.99] disabled:opacity-50 mt-4 text-sm"
              >
                {loading ? "Authenticating..." : "Masuk ke Dashboard"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400 font-medium">
                Gunakan akun administrator yang telah terdaftar di database.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}