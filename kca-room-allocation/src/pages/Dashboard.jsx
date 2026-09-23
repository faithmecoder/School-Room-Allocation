import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    total_classes: 0, 
    total_cohorts: 0, 
    total_rooms: 0,
    utilization_rate: 0,
    top_utilized_rooms: [] 
  });
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/stats').catch(() => ({ data: { total_classes: 0, total_cohorts: 0, total_rooms: 0, utilization_rate: 0, top_utilized_rooms: [] } })),
      axios.get('http://localhost:8000/api/conflicts').catch(() => ({ data: [] }))
    ]).then(([statsRes, conflictsRes]) => {
      setStats(statsRes.data);
      setConflicts(conflictsRes.data);
      setLoading(false);
    });
  }, []);

  const highSeverityConflicts = conflicts.filter(c => c.severity === 'High').slice(0, 5);

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">System Overview</h2>
          <p className="text-gray-600 text-[16px]">Live statistics and room utilization analytics for the Master Timetable.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/upload" className="px-4 py-2 text-[13px] font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
            + Upload New Data
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Classes</span>
          <span className="text-4xl font-extrabold text-gray-800">{loading ? '...' : stats.total_classes}</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Active Cohorts</span>
          <span className="text-4xl font-extrabold text-blue-600">{loading ? '...' : stats.total_cohorts}</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Rooms In Use</span>
          <span className="text-4xl font-extrabold text-emerald-600">{loading ? '...' : stats.total_rooms}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">System Utilization</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-indigo-600">{loading ? '...' : `${stats.utilization_rate}%`}</span>
            <span className="text-xs text-gray-400 font-medium">Capacity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Action Required Panel (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Priority Action Required</h3>
            {highSeverityConflicts.length > 0 && (
              <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {highSeverityConflicts.length} Critical Issues
              </span>
            )}
          </div>
          
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Scanning for issues...</div>
            ) : highSeverityConflicts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">All Clear!</h4>
                <p className="text-gray-500 text-sm">No high-severity room clashes or capacity overruns detected.</p>
              </div>
            ) : (
              highSeverityConflicts.map(c => (
                <div key={c.id} className="p-5 flex items-start justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {c.room}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{c.day} • {c.time_slot}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1.5">{c.issue}</p>
                    <p className="text-xs text-gray-500 font-medium">Affects: {c.course}</p>
                  </div>
                  <Link to="/reports" className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    Resolve
                  </Link>
                </div>
              ))
            )}
          </div>
          {highSeverityConflicts.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <Link to="/reports" className="text-sm font-bold text-gray-600 hover:text-gray-900">
                View all {conflicts.length} conflicts →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Quick Links & Utilization */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Links Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Quick Links</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <Link to="/timetable" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Master Timetable</h4>
                  <p className="text-xs text-gray-500">Search by cohort or room</p>
                </div>
              </Link>

              <Link to="/reports" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Validation Reports</h4>
                  <p className="text-xs text-gray-500">Reassign clashing units</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Room Utilization Analytics Panel (Now Scrollable) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[450px]">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex-shrink-0 rounded-t-xl">
              <h3 className="font-bold text-gray-800">All Rooms Utilization</h3>
            </div>
            
            {/* Added overflow-y-auto here so the list scrolls neatly inside the panel */}
            <div className="p-6 overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-500 text-sm">Calculating utilization...</div>
              ) : stats.top_utilized_rooms?.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">No physical room data available.</div>
              ) : (
                <div className="space-y-5">
                  {stats.top_utilized_rooms.map((room) => {
                    const percentage = Math.min((room.classes / 20) * 100, 100);
                    return (
                      <div key={room.room}>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-sm font-bold text-gray-700">{room.room}</span>
                          <span className="text-xs font-semibold text-gray-500">{room.classes} bookings</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}