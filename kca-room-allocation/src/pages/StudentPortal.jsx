import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentPortal() {
  const [schedule, setSchedule] = useState([]);
  const [filters, setFilters] = useState({ cohorts: [], rooms: [] });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/filters')
      .then(res => setFilters(res.data))
      .catch(err => console.error("Failed to load filters", err));
  }, []);

  useEffect(() => {
    if (!selectedCohort) {
      setSchedule([]);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:8000/api/timetable?cohort=${encodeURIComponent(selectedCohort)}`)
      .then(res => {
        setSchedule(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch timetable", err);
        setLoading(false);
      });
  }, [selectedCohort]);

  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="min-h-screen bg-[#eaf1f5] font-sans pb-12">
      
      {/* Header - Updated to Dark Teal */}
      <div className="bg-[#1f4153] text-white px-6 py-8 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-3xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Class Rep & Lecturer Portal</h1>
            <p className="text-gray-300 text-sm md:text-base">Check your live, conflict-free weekly schedule.</p>
          </div>
          
          <button 
            onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} 
            className="text-white text-sm font-semibold underline mt-2 hover:text-gray-300 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Search & Selection Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Your Cohort</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1f4153] focus:bg-white transition-colors"
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
          >
            <option value="">-- Choose Cohort --</option>
            {filters.cohorts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {selectedCohort && schedule.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lecturer: Filter by Unit Code</label>
              <input 
                type="text" 
                placeholder="e.g. BIT 3202A..." 
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4153]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>
          )}
        </div>

        {/* Schedule Display */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <svg className="w-8 h-8 animate-spin text-[#1f4153] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Fetching latest schedule...
          </div>
        ) : !selectedCohort ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-[#eaf1f5] text-[#1f4153] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Cohort Selected</h3>
            <p className="text-gray-500 text-sm mt-1">Select your cohort from the dropdown above to view your classes.</p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
            No classes scheduled for {selectedCohort}.
          </div>
        ) : (
          <div className="space-y-8">
            {daysOfWeek.map(day => {
              const dayClasses = (groupedSchedule[day] || []).filter(item => 
                searchQuery === '' || 
                item.unit_code.toLowerCase().includes(searchQuery) || 
                item.unit_name.toLowerCase().includes(searchQuery)
              );

              if (dayClasses.length === 0) return null;

              return (
                <div key={day} className="animate-fade-in">
                  <h3 className="text-lg font-extrabold text-gray-800 mb-4 px-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1f4153]"></span>
                    {day}
                  </h3>
                  
                  <div className="space-y-3">
                    {dayClasses.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#5684a1] transition-colors flex gap-4 items-center">
                        
                        {/* Time Bubble */}
                        <div className="flex-shrink-0 w-24 flex flex-col justify-center items-center p-2 bg-[#eaf1f5] rounded-lg border border-gray-200">
                          <span className="text-xs font-bold text-[#1f4153] text-center">{item.time_slot}</span>
                        </div>
                        
                        {/* Class Details */}
                        <div className="flex-1">
                          <h4 className="text-sm font-extrabold text-gray-900 leading-tight mb-1">{item.unit_name}</h4>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.unit_code}</span>
                        </div>
                        
                        {/* Room Details */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-[15px] font-extrabold text-[#1f4153]">{item.room}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{item.room_type}</div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}