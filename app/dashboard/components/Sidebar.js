// app/dashboard/components/Sidebar.js
import { Icons } from "./Icons";

export default function Sidebar({ activeTab, setActiveTab, menuItems, adminUser, handleLogout }) {
  return (
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
  );
}