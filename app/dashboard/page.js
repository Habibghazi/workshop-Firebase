"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/app/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// IMPORT KOMPONEN MODULAR
import { Icons } from "./components/Icons";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";
import DashboardView from "./components/DashboardView";
import LoginActivityView from "./components/LoginActivityView";
import UsersView from "./components/UsersView";
import SecurityAlertsView from "./components/SecurityAlertsView";

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // 1. PROTEKSI HALAMAN: Cek Sesi Admin & Whitelist
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

    // 2. REAL-TIME MONITORING: Ambil Log dari Firestore
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

  // FUNGSI LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // FUNGSI CLEAR DATA
  const handleClearData = async () => {
    const confirmDelete = window.confirm("Sistem Keamanan: Yakin ingin menghapus seluruh riwayat log?");
    if (!confirmDelete) return;
    try {
      const deletePromises = logs.map((logItem) => deleteDoc(doc(db, "login_logs", logItem.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Gagal menghapus data: ", error);
    }
  };

  // --- LOGIKA PENGOLAHAN DATA (BUSINESS LOGIC) ---
  const successCount = logs.filter(l => l.status?.includes("SUCCESS")).length;
  const threatCount = logs.filter(l => 
    l.status?.includes("BLOCKED") || 
    l.status?.includes("ATTACK") || 
    l.status?.includes("BRUTE")
  ).length;
  const uniqueUsers = [...new Set(logs.map(l => l.email).filter(Boolean))];
  
  // Data untuk Grafik (Simulasi distribusi data berdasarkan jumlah log)
  const chartData = logs.length > 0 
    ? [12, 18, 7, 25, 14, 30, logs.length] 
    : [0, 0, 0, 0, 0, 0, 0];

  // Konfigurasi Statistik Utama
  const stats = [
    { 
      title: "Total Activities", 
      count: logs.length, 
      icon: <Icons.Activity />, 
      bg: "bg-blue-50 text-blue-600", 
      border: "bg-blue-500" 
    },
    { 
      title: "Unique Users", 
      count: uniqueUsers.length, 
      icon: <Icons.Users />, 
      bg: "bg-indigo-50 text-indigo-600", 
      border: "bg-indigo-500" 
    },
    { 
      title: "Security Threats", 
      count: threatCount, 
      icon: <Icons.Alert />, 
      bg: "bg-rose-50 text-rose-600", 
      border: "bg-rose-500" 
    },
    { 
      title: "Success Rate", 
      count: logs.length > 0 ? `${Math.round((successCount / logs.length) * 100)}%` : "0%", 
      icon: <Icons.Shield />, 
      bg: "bg-emerald-50 text-emerald-600", 
      border: "bg-emerald-500" 
    }
  ];

  // Menu Sidebar
  const menuItems = [
    { id: "dashboard", icon: <Icons.Dashboard />, label: "Dashboard" },
    { id: "login_activity", icon: <Icons.Activity />, label: "Login Activity" },
    { id: "users", icon: <Icons.Users />, label: "Users" },
    { id: "security_alerts", icon: <Icons.Alert />, label: "Security Alerts", badge: threatCount },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 selection:bg-indigo-100">
      
      {/* SIDEBAR COMPONENT */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        menuItems={menuItems} 
        adminUser={adminUser} 
        handleLogout={handleLogout} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' 
                ? `Welcome back, ${adminUser?.email?.split('@')[0] || "Admin"}.` 
                : menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sistem monitoring aktif dan terhubung ke Firebase Cloud.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClearData}
              className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-xs px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Icons.Trash /> Clear Logs
            </button>
          </div>
        </div>

        {/* STATS GRID COMPONENT */}
        <StatsGrid stats={stats} />

        {/* DYNAMIC VIEW CONTENT */}
        <div className="mt-8">
          {activeTab === "dashboard" && (
            <DashboardView 
              logs={logs} 
              successCount={successCount} 
              chartData={chartData} 
            />
          )}

          {activeTab === "login_activity" && (
            <LoginActivityView logs={logs} />
          )}

          {activeTab === "users" && (
            <UsersView uniqueUsers={uniqueUsers} />
          )}

          {activeTab === "security_alerts" && (
            <SecurityAlertsView alertLogs={logs} />
          )}
        </div>

      </main>
    </div>
  );
}