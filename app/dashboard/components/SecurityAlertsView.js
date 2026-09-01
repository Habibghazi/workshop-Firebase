"use client";
import { Icons } from "./Icons";

export default function SecurityAlertsView({ alertLogs }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm shadow-red-200">
          <Icons.Alert />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Security Command Center</h3>
          <p className="text-xs text-slate-500">Anomali dan serangan terdeteksi sistem</p>
        </div>
      </div>

      {alertLogs.length === 0 ? (
        <div className="p-12 text-center bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <p className="text-sm font-bold text-emerald-700">Sistem Aman. Tidak ada ancaman terdeteksi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alertLogs.map((log) => (
            <div key={log.id} className="group bg-white p-5 rounded-2xl border border-red-100 bg-red-50/10 hover:bg-red-50/30 shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <p className="text-sm font-bold text-slate-900">Target: {log.email || "Unknown"}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  IP: <span className="text-slate-700">{log.ipAddress}</span> | 
                  Loc: <span className="text-indigo-600 font-bold">{log.location}</span>
                </p>
                <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-1">
                  Type: {log.attackType || log.status}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                  {log.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Baru saja"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}