import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_classes: 0, total_rooms: 0, active_cohorts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      });
  }, []);

  const metrics = [
    { title: 'Parsed Classes', value: loading ? '...' : stats.total_classes, icon: 'description', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Unique Rooms Found', value: loading ? '...' : stats.total_rooms, icon: 'meeting_room', color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'Active Cohorts', value: loading ? '...' : stats.active_cohorts, icon: 'group', color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">System Dashboard</h2>
          <p className="text-on-surface-variant text-[16px]">Live overview based on your uploaded master schedule.</p>
        </div>
        <Link to="/upload" className="bg-primary text-on-primary text-[14px] font-bold px-6 py-2.5 rounded-lg hover:bg-opacity-90 shadow-md transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 flex items-center gap-5">
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

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 p-6">
        <h3 className="font-bold text-on-surface text-[18px] mb-2">System Status</h3>
        <p className="text-on-surface-variant text-[14px]">
          Database is synchronized with your uploaded `.xlsx` file. Real-time conflict detection is active across all sheets.
        </p>
      </div>
    </div>
  );
}