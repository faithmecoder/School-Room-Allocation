import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [user, setUser] = useState({ full_name: 'Admin' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    axios.get('http://localhost:8000/api/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));

    axios.get('http://localhost:8000/api/conflicts')
      .then(res => setConflicts(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div className="p-8 text-[#1f4153]">Loading Dashboard...</div>;

  const topRooms = stats.top_utilized_rooms?.slice(0, 6) || [];
  const maxClasses = topRooms.length > 0 ? topRooms[0].classes : 1;

  const handleBroadcast = async () => {
    if (!window.confirm("Send update email to ALL Class Reps?")) return;
    
    try {
      alert("Sending emails... Please wait.");
      const response = await axios.post('http://localhost:8000/api/broadcast', {
        subject: "Action Required: Updated Timetable Available",
        message: "The master timetable has been updated to resolve recent venue conflicts. Please log in to the portal immediately to check if your cohort's classes have been moved."
      });
      alert(response.data.message);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send emails.");
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-semibold text-[#1f4153] mb-4 md:mb-0">
          Welcome {user.full_name.split(' ')[0]} !
        </h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-[#1f4153]"
            />
            <svg className="w-4 h-4 text-gray-400 absolute right-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="p-2 bg-[#1f4153] text-white rounded-full hover:bg-[#2c5a73] transition-colors shadow-md">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </button>
          <button className="p-2 bg-white text-gray-400 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <button 
          onClick={handleBroadcast}
          className="px-4 py-2 bg-[#1f4153] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#2c5a73] transition-colors"
          >
          Notify Class Reps
          </button>


        </div>
      </div>

      <h2 className="text-[15px] font-bold text-gray-700 mb-4 px-2">Over View</h2>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Classes */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#eaf1f5] flex items-center justify-center text-[#1f4153]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.total_classes}</div>
            <div className="text-xs text-gray-500 font-medium">Total Classes</div>
          </div>
        </div>

        {/* Cohorts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#eaf1f5] flex items-center justify-center text-[#1f4153]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.total_cohorts}</div>
            <div className="text-xs text-gray-500 font-medium">Active Cohorts</div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#eaf1f5] flex items-center justify-center text-[#1f4153]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.total_rooms}</div>
            <div className="text-xs text-gray-500 font-medium">Total Facilities</div>
          </div>
        </div>

        {/* Conflicts - Styled with the soft orange/red border */}
        <div className="bg-[#fff7f0] rounded-xl p-5 shadow-sm border border-orange-200 flex items-center gap-4 relative">
          <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{conflicts.length}</div>
            <div className="text-xs text-orange-800 font-medium">Active Conflicts</div>
          </div>
          <Link to="/reports" className="absolute bottom-2 right-2 text-gray-400 hover:text-orange-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </Link>
        </div>
      </div>

      {/* Main Grid Widget Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Users & Pie Chart) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Simple User Stat */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-gray-700">No of users</h3>
              <button className="text-gray-400">⋮</button>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#eaf1f5] rounded-xl flex items-center justify-center text-[#1f4153]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">45+</div>
                <div className="text-xs text-gray-400">System Access</div>
              </div>
            </div>
          </div>

          {/* Utilization Pie Chart Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center relative h-64">
            <h3 className="text-sm font-bold text-gray-700 absolute top-6 left-6">Utilization Value</h3>
            
            <div className="flex items-center gap-8 mt-6">
              {/* CSS Pie Chart */}
              <div 
                className="w-32 h-32 rounded-full relative flex items-center justify-center"
                style={{
                  background: `conic-gradient(#5684a1 ${stats.utilization_rate}%, #c8dce6 ${stats.utilization_rate}%)`
                }}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[#1f4153]">{stats.utilization_rate}%</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-[#5684a1]"></span>
                  <span className="text-xs text-gray-500 font-medium">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-[#c8dce6]"></span>
                  <span className="text-xs text-gray-500 font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Horizontal Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-6">Top Utilized Rooms by Classes</h3>
          
          <div className="space-y-5 mt-4">
            {topRooms.map((room, index) => {
              const percentage = (room.classes / maxClasses) * 100;
              return (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-24 font-medium text-gray-600 truncate mr-4">{room.room}</div>
                  <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#3d657d] h-full rounded-r-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-xs font-bold text-gray-500 ml-4">{room.classes}</div>
                </div>
              );
            })}
            {topRooms.length === 0 && (
              <div className="text-center text-gray-400 py-10">No room data available.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}