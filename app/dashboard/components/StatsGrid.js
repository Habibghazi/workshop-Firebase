"use client";
import { Icons } from "./Icons";

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">{stat.count}</h3>
          </div>
          {/* Dekorasi Garis Halus */}
          <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.border}`}></div>
        </div>
      ))}
    </div>
  );
}