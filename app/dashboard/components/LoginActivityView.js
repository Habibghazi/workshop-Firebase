"use client";

export default function LoginActivityView({ logs }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm">Security Log Stream</h3>
        <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg uppercase">Live Data</span>
      </div>
      
      {logs.length === 0 ? (
        <div className="p-16 text-center text-sm text-slate-400 font-medium">Belum ada aktivitas login terekam.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">User / Account</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Network & Location</th>
                <th className="px-6 py-4 font-bold">Device Detail</th>
                <th className="px-6 py-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{log.email || "Anonymous"}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.userAgent}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                      log.status?.includes("SUCCESS") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      log.status?.includes("BLOCKED") ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>{log.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-600">{log.ipAddress || "Localhost"}</div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-0.5">📍 {log.location || "Unknown"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-700">{log.os} • {log.browser}</div>
                    <div className="text-[10px] text-slate-400">{log.screenRes || "N/A"} • {log.device}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : "Just now"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}