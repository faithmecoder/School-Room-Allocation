import { Link } from 'react-router-dom';

export default function Dashboard() {
  const metrics = [
    { title: 'Total Rooms', value: '42', icon: 'meeting_room', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active Timetables', value: '3', icon: 'calendar_month', color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'Pending Conflicts', value: '12', icon: 'warning', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">System Dashboard</h2>
          <p className="text-on-surface-variant text-[16px]">Overview of university room allocations and current system status.</p>
        </div>
        <Link to="/upload" className="bg-primary text-on-primary text-[14px] font-bold px-6 py-2.5 rounded-lg hover:bg-opacity-90 shadow-md transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload New
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-14 h-14 rounded-full ${metric.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[28px] ${metric.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {metric.icon}
              </span>
            </div>
            <div>
              <p className="text-[14px] text-on-surface-variant font-semibold mb-1">{metric.title}</p>
              <h3 className="text-[28px] font-bold text-on-surface leading-none">{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent System Activity */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
          <h3 className="font-bold text-on-surface">Recent System Activity</h3>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[1, 2, 3].map((_, idx) => (
             <div key={idx} className="p-4 px-6 flex items-center justify-between hover:bg-surface-container-low/40 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-[20px]">sync</span>
                 </div>
                 <div>
                   <p className="text-[15px] font-semibold text-on-surface">Timetable Validation Completed</p>
                   <p className="text-[13px] text-on-surface-variant mt-0.5">Automated check finished for BSC IT Year 2</p>
                 </div>
               </div>
               <span className="text-[12px] text-on-surface-variant font-medium border border-outline-variant/30 px-3 py-1 rounded-full">
                 Just now
               </span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}