export default function LoginActivityView({ logs }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "WORKSHOP_SUCCESS": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "SECURITY_ATTACK_BLOCKED": return "bg-red-600 text-white border-red-800 animate-bounce";
      case "BRUTE_FORCE_LOCKOUT": return "bg-orange-100 text-orange-700 border-orange-300";
      case "USER_NOT_FOUND": return "bg-slate-100 text-slate-700 border-slate-300";
      default: return "bg-red-100 text-red-700 border-red-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Status & Detail</th>
            <th className="px-6 py-4">IP Address</th>
            <th className="px-6 py-4">Waktu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium">{log.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusStyle(log.status)}`}>
                  {log.status}
                </span>
                <div className="text-[9px] text-slate-400 mt-1">{log.detail || ""}</div>
              </td>
              <td className="px-6 py-4 font-mono text-xs">{log.ipAddress}</td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {log.timestamp?.toDate().toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}