"use client";
import { Icons } from "./Icons";

export default function DashboardView({ logs, successCount, failedCount, blockedCount, chartData, uniqueUsersCount }) {
  // Ambil 5 aktivitas terbaru untuk feed
  const recentActivities = logs.slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Grafik & Live Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Grafik (2/3 Lebar) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Traffic Analysis</h3>
              <p className="text-xs text-slate-500">Visualisasi beban login sistem</p>
            </div>
            <select className="text-xs border-slate-200 rounded-lg bg-slate-50 p-1.5 outline-none">
              <option>Last 7 Days</option>
              <option>Last 24 Hours</option>
            </select>
          </div>

          <div className="flex items-end gap-4 h-64 mt-4 px-2">
            {chartData.map((height, i) => {
              const maxHeight = Math.max(...chartData, 1);
              const percentage = (height / maxHeight) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="w-full relative flex items-end justify-center h-full">
                    <div 
                      className="w-full max-w-[32px] bg-indigo-500/20 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-500" 
                      style={{ height: `100%` }} // Background bar
                    ></div>
                    <div 
                      className="w-full max-w-[32px] bg-indigo-600 rounded-t-lg absolute bottom-0 shadow-[0_-4px_12px_rgba(79,70,229,0.3)] transition-all duration-1000 ease-out" 
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">D{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Live Activity (1/3 Lebar) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-sm">Live Activity</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <div className="space-y-5">
            {recentActivities.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">Menunggu data...</p>
            ) : (
              recentActivities.map((log) => (
                <div key={log.id} className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 relative">
                  {/* Dot Indicator */}
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                    log.status?.includes("SUCCESS") ? "bg-emerald-500" : "bg-rose-500"
                  }`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">
                      {log.email?.split('@')[0] || "Unknown"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {log.status?.includes("SUCCESS") ? "Berhasil masuk sistem" : "Gagal/Blokir Keamanan"}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : "Baru saja"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="w-full mt-6 py-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            Lihat Semua Log
          </button>
        </div>

      </div>
    </div>
  );
}