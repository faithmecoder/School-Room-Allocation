import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MasterTimetable() {
  const [schedule, setSchedule] = useState([]);
  const [filters, setFilters] = useState({ cohorts: [], rooms: [] });
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Fetch dropdown options on load
  useEffect(() => {
    axios.get('http://localhost:8000/api/filters')
      .then(res => setFilters(res.data))
      .catch(err => console.error("Failed to load filters", err));
  }, []);

  // Fetch schedule whenever a filter changes
  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:8000/api/timetable?';
    if (selectedCohort) url += `cohort=${encodeURIComponent(selectedCohort)}&`;
    if (selectedRoom) url += `room=${encodeURIComponent(selectedRoom)}`;

    axios.get(url)
      .then(res => {
        setSchedule(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch timetable", err);
        setLoading(false);
      });
  }, [selectedCohort, selectedRoom]);

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">Master Timetable Explorer</h2>
        <p className="text-gray-600 text-[16px]">Search and view the resolved schedule by specific cohort or lecture facility.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Filter by Cohort</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={selectedCohort}
            onChange={(e) => {
              setSelectedCohort(e.target.value);
              setSelectedRoom(''); // Clear room filter when cohort is selected
            }}
          >
            <option value="">-- All Cohorts --</option>
            {filters.cohorts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-center px-4">
          <span className="text-gray-400 font-bold text-sm">OR</span>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Filter by Room</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setSelectedCohort(''); // Clear cohort filter when room is selected
            }}
          >
            <option value="">-- All Rooms --</option>
            {filters.rooms.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => { setSelectedCohort(''); setSelectedRoom(''); }}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Day</th>
                <th className="px-5 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Time</th>
                <th className="px-5 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Cohort</th>
                <th className="px-5 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Unit</th>
                <th className="px-5 py-4 text-[13px] font-bold text-gray-600 uppercase tracking-wider">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading schedule...</td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No classes found for this selection.</td>
                </tr>
              ) : (
                schedule.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-gray-800 whitespace-nowrap">{item.day}</td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-gray-600 whitespace-nowrap">{item.time_slot}</td>
                    <td className="px-5 py-3.5 text-[13px] font-bold text-blue-800 bg-blue-50/30 whitespace-nowrap">{item.cohort}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">
                      <span className="font-bold mr-2">{item.unit_code}</span>
                      {item.unit_name}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-bold text-gray-800 whitespace-nowrap">
                      {item.room}
                      <span className="block text-[11px] font-normal text-gray-500 mt-0.5">{item.room_type}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
