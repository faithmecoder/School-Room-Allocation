import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/rooms')
      .then(res => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch rooms", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Room Management</h2>
          <p className="text-on-surface-variant text-[16px]">Active facilities extracted from your university timetable.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room Code</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Facility Name</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Default Capacity</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">Loading rooms from database...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No rooms found. Please upload a timetable first.</td></tr>
              ) : (
                rooms.map((room, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4 font-mono-sm text-[13px] font-bold text-on-surface">{room.code}</td>
                    <td className="px-6 py-4 text-[14px] font-medium text-on-surface-variant">{room.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-surface-container-high text-on-surface">
                        {room.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-on-surface-variant">{room.capacity} Seats</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        {room.status}
                      </span>
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