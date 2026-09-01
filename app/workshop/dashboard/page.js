"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserPortal() {
  const [sessionData, setSessionData] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const data = sessionStorage.getItem("user_session");
    if (data) {
      setSessionData(JSON.parse(data));
    } else {
      router.push("/workshop/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("user_session");
    router.push("/workshop/login");
  };

  if (!isMounted || !sessionData) return null;

  // Mengambil nama depan dari email (contoh: user1@workshop.com -> User1)
  const username = sessionData.email.split("@")[0];
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          </div>
          <span>AppPortal</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
        >
          Sign Out
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto p-6 sm:p-10 mt-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Welcome back, {displayName}!
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              You have successfully signed in to your account. This is your personal homepage.
            </p>
          </div>
          
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg shadow-indigo-100 shrink-0 uppercase">
            {displayName.charAt(0)}
          </div>

        </div>

        {/* MOCKUP KONTEN KOSONG */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="h-32 bg-slate-100/60 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center">
             <span className="text-slate-400 font-medium text-sm">Dashboard Widget</span>
          </div>
          <div className="h-32 bg-slate-100/60 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center">
             <span className="text-slate-400 font-medium text-sm">Recent Activity</span>
          </div>
          <div className="h-32 bg-slate-100/60 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center">
             <span className="text-slate-400 font-medium text-sm">Account Settings</span>
          </div>
        </div>
      </main>

    </div>
  );
}