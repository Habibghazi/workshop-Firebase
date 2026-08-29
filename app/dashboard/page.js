"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// --- SVG ICONS (Heroicons Outline) ---
const Icons = {
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043A3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296A3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043A3.746 3.746 0 0 1 21 12Z" /></svg>,
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>,
  Sessions: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>,
  Devices: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>,
  Locations: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>,
  Logout: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Settings: () => <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.79l.867-1.221m7.264-10.221.867-1.221m-14.095 5.13 1.41.513m14.095 5.13 1.41.513M5.106 6.215l1.15.964m11.49 9.642 1.149.964m-14.095-5.13 1.41.513m14.095 5.13 1.41.513M7.501 4.21l.867 1.221m7.264 10.221.867 1.221M12 21v-1.5m0-15V3" /></svg>
};

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(collection(db, "admin_whitelist"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await signOut(auth);
          router.push("/");
          return;
        }

        setAdminUser(user);
      } else {
        router.push("/");
      }
    });

    const qLogs = query(collection(db, "login_logs"), orderBy("timestamp", "desc"));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const logData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeLogs();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleClearData = async () => {
    const confirmDelete = window.confirm("Yakin ingin menghapus seluruh riwayat log?");
    if (!confirmDelete) return;

    try {
      const deletePromises = logs.map((logItem) => deleteDoc(doc(db, "login_logs", logItem.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Gagal menghapus data: ", error);
      alert("Terjadi kesalahan saat membersihkan data.");
    }
  };

  const successCount = logs.filter(l => l.status?.includes("SUCCESS")).length;
  const failedCount = logs.filter(l => l.status?.includes("FAILED")).length;
  const blockedCount = logs.filter(l => l.status?.includes("BLOCKED")).length;
  const alertLogs = logs.filter(l => l.status?.includes("FAILED") || l.status?.includes("BLOCKED"));
  const uniqueUsers = [...new Set(logs.map(l => l.email).filter(Boolean))];

  const chartData = logs.length > 0 
    ? [logs.length * 0.1, logs.length * 0.25, logs.length * 0.15, logs.length * 0.35, logs.length * 0.2, logs.length * 0.45, Math.min(logs.length, 100)] 
    : [0, 0, 0, 0, 0, 0, 0];

  const menuItems = [
    { id: "dashboard", icon: <Icons.Dashboard />, label: "Dashboard" },
    { id: "login_activity", icon: <Icons.Activity />, label: "Login Activity" },
    { id: "users", icon: <Icons.Users />, label: "Users" },
    { id: "security_alerts", icon: <Icons.Alert />, label: "Security Alerts", badge: alertLogs.length },
    { id: "sessions", icon: <Icons.Sessions />, label: "Sessions" },
    { id: "devices", icon: <Icons.Devices />, label: "Devices" },
    { id: "locations", icon: <Icons.Locations />, label: "Locations" },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* SIDEBAR dengan Efek Bayangan Lembut */}
      <aside className="w-64 bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex flex-col justify-between p-5 shrink-0 h-screen sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Icons.Shield />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg tracking-tight leading-tight">LoginShield</h1>
              <p className="text-[11px] text-slate-500 font-medium">Monitoring System</p>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm font-medium">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-blue-50/90 text-blue-700 shadow-sm shadow-blue-500/5 border border-blue-100/60 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}>{item.icon}</span> 
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${activeTab === item.id ? 'bg-blue-100 text-blue-700' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* PROFIL DINAMIS */}
        <div className="pt-4 mt-8 border-t border-slate-100 flex items-center justify-between px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 uppercase shrink-0 shadow-inner">
              {adminUser?.email ? adminUser.email.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {adminUser?.email || "Admin User"}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 p-2 transition-colors rounded-xl hover:bg-red-50 shrink-0" title="Keluar">
            <Icons.Logout />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' 
                ? `Welcome back, ${adminUser?.email?.split('@')[0] || "Admin"}.` 
                : menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'dashboard' ? "Here's what is happening with your login activities today." : `Real-time management for ${menuItems.find(m => m.id === activeTab)?.label.toLowerCase()}.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClearData}
              disabled={!isMounted || logs.length === 0}
              className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Trash /> Kosongkan Data
            </button>

            <button 
              onClick={handleLogout}
              className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Icons.Logout /> Keluar Sesi
            </button>
          </div>
        </div>

        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: "Total Login Attempts", count: logs.length, color: "blue" },
                { title: "Successful Logins", count: successCount, color: "emerald" },
                { title: "Failed Attempts", count: failedCount, color: "red" },
                { title: "Blocked Attempts", count: blockedCount, color: "amber" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all relative overflow-hidden group">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.count}</h3>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 p-6 relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-bold text-slate-900">Login Activity Overview</h3>
                  <p className="text-xs text-slate-500 mt-1">Distribusi aktivitas 7 hari terakhir</p>
                </div>
              </div>
              
              {logs.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-400">Menunggu aliran data aktivitas...</p>
                  <p className="text-xs text-slate-400 mt-1">Lakukan simulasi login untuk melihat grafik</p>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-64 mt-4 px-2 border-b border-slate-100 pb-2">
                  {chartData.map((height, i) => {
                    const maxHeight = Math.max(...chartData);
                    const percentage = maxHeight > 0 ? (height / maxHeight) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                        <div className="w-full relative flex items-end justify-center h-full">
                          <div 
                            className="w-full max-w-[40px] bg-blue-600/90 rounded-t-lg shadow-sm shadow-blue-500/20 transition-all duration-1000 ease-out group-hover:bg-blue-500" 
                            style={{ height: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">Day {i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: LOGIN ACTIVITY --- */}
        {activeTab === "login_activity" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 overflow-hidden animate-in fade-in duration-500">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Security Log Stream (Lengkap dengan Metadata)</h3>
            </div>
            
            {logs.length === 0 ? (
              <div className="p-16 text-center text-sm text-slate-400">Log sistem kosong.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[11px] uppercase tracking-wider">
                      <th className="px-6 py-3.5 font-bold">Email</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                      <th className="px-6 py-3.5 font-bold">IP Address</th>
                      <th className="px-6 py-3.5 font-bold">Perangkat & Browser</th>
                      <th className="px-6 py-3.5 font-bold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{log.email || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                            log.status?.includes("SUCCESS") ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/5" :
                            log.status?.includes("BLOCKED") ? "bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-500/5" : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-500/5"
                          }`}>{log.status}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.ipAddress || "Localhost"}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          <div>{log.device || "Desktop"}</div>
                          <div className="text-[10px] text-slate-400">{log.browser || "-"}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Baru saja"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: USERS --- */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500">
            {uniqueUsers.length === 0 ? (
               <div className="col-span-full text-center text-sm text-slate-400 p-12 border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">Belum ada identitas pengguna terekam.</div>
            ) : uniqueUsers.map((email, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                  {email.charAt(0)}
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{email}</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wide">Terautentikasi</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW: SECURITY ALERTS (Dengan Efek Bayangan / Glow Card) --- */}
        {activeTab === "security_alerts" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 p-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm shadow-red-500/10"><Icons.Alert /></div>
              <h3 className="font-bold text-slate-900">Ancaman Keamanan & Anomali</h3>
            </div>
            {alertLogs.length === 0 ? (
               <div className="p-8 text-center bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
                 <p className="text-sm font-semibold text-emerald-700">Sistem stabil. Tidak ada ancaman atau akses diblokir.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {alertLogs.map((log) => (
                  <div key={log.id} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 hover:border-red-200 shadow-md shadow-slate-200/30 hover:shadow-lg hover:shadow-red-500/5 flex justify-between items-center transition-all duration-200">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{log.email || "Unknown"}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">IP: {log.ipAddress || "N/A"} | {log.error || "Akses mencurigakan diblokir sistem"}</p>
                    </div>
                    <span className="bg-red-50 text-red-600 border border-red-200/60 text-[11px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider shadow-sm shadow-red-500/10">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: MODUL LAINNYA --- */}
        {(activeTab === "sessions" || activeTab === "devices" || activeTab === "locations") && (
          <div className="h-64 bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <Icons.Settings />
            <h3 className="text-lg font-bold text-slate-900 mt-4">Modul {activeTab.replace('_', ' ').toUpperCase()}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md text-center">
              Area manajemen data ini sedang dalam tahap pengembangan integrasi.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}