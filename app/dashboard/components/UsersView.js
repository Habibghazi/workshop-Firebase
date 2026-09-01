export default function UsersView({ uniqueUsers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500">
      {uniqueUsers.length === 0 ? (
         <div className="col-span-full text-center text-sm text-slate-400 p-12 border border-dashed border-slate-200 rounded-2xl bg-white">Belum ada pengguna.</div>
      ) : uniqueUsers.map((email, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-lg uppercase">
            {email.charAt(0)}
          </div>
          <div className="truncate">
            <h4 className="font-bold text-slate-900 text-sm truncate">{email}</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase">Terautentikasi</p>
          </div>
        </div>
      ))}
    </div>
  );
}