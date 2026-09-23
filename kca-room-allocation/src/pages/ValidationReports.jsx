import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValidationReports() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlternatives, setSelectedAlternatives] = useState({});
  const [selectedUnitsToMove, setSelectedUnitsToMove] = useState({});
  const [reassigningId, setReassigningId] = useState(null);

  const fetchConflicts = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/conflicts')
      .then(res => {
        setConflicts(res.data);
        // Pre-set defaults for dropdowns
        const defaultRooms = {};
        const defaultUnits = {};
        res.data.forEach(c => {
          if (c.suggested_rooms?.length > 0) {
            defaultRooms[c.id] = c.suggested_rooms[0].room_code;
          }
          if (c.units_involved?.length > 0) {
            defaultUnits[c.id] = c.units_involved[0];
          }
        });
        setSelectedAlternatives(defaultRooms);
        setSelectedUnitsToMove(defaultUnits);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch conflicts", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleReassign = async (item) => {
    const targetRoom = selectedAlternatives[item.id] || item.suggested_rooms?.[0]?.room_code;
    const unitToMove = selectedUnitsToMove[item.id] || item.units_involved?.[0];

    if (!targetRoom) {
      alert("No target room selected.");
      return;
    }
    if (!unitToMove) {
      alert("No unit selected to relocate.");
      return;
    }

    setReassigningId(item.id);
    try {
      const response = await axios.post('http://localhost:8000/api/conflicts/reassign', {
        day: item.day,
        time_slot: item.time_slot,
        old_room: item.room,
        new_room: targetRoom,
        unit_to_move: unitToMove
      });

      if (response.status === 200) {
        alert(response.data.message || `Successfully relocated ${unitToMove} to ${targetRoom}!`);
        fetchConflicts();
      }
    } catch (err) {
      console.error("Reassignment failed", err);
      alert(err.response?.data?.detail || "Reassignment failed. Ensure backend is running.");
    } finally {
      setReassigningId(null);
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Validation Reports</h2>
          <p className="text-on-surface-variant text-[16px]">Automated conflict detection pulled directly from your master timetable.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchConflicts}
            className="px-4 py-2 text-[13px] font-semibold rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Refresh Scan
          </button>
          
          <button
            onClick={() => window.open('http://localhost:8000/api/export', '_blank')}
            className="px-4 py-2 text-[13px] font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Resolved Timetable
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">ID</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Conflicting Units</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Issue Details</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Relocate Unit</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Move To</th>
                <th className="px-5 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">
                    Scanning database for conflicts and available alternative rooms...
                  </td>
                </tr>
              ) : conflicts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-green-700 font-medium">
                    No scheduling conflicts or capacity overruns detected!
                  </td>
                </tr>
              ) : (
                conflicts.map((item) => {
                  const hasSuggestions = item.suggested_rooms && item.suggested_rooms.length > 0;
                  const isWorking = reassigningId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-[13px] text-primary font-medium">{item.id}</td>
                      <td className="px-5 py-4 text-[14px] font-semibold text-on-surface">{item.room}</td>
                      <td className="px-5 py-4 text-[14px] text-on-surface-variant max-w-xs">{item.course}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1 ${
                          item.severity === 'High' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {item.severity}
                        </span>
                        <div className="text-[12px] text-gray-600">{item.issue}</div>
                      </td>

                      {/* Select WHICH unit to move */}
                      <td className="px-5 py-4">
                        {item.units_involved && item.units_involved.length > 0 ? (
                          <select
                            className="bg-white border border-outline-variant rounded-md px-2 py-1 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary max-w-[160px]"
                            value={selectedUnitsToMove[item.id] || item.units_involved[0]}
                            onChange={(e) => setSelectedUnitsToMove({ ...selectedUnitsToMove, [item.id]: e.target.value })}
                          >
                            {item.units_involved.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[12px] text-gray-400">All</span>
                        )}
                      </td>

                      {/* Select TARGET room */}
                      <td className="px-5 py-4">
                        {hasSuggestions ? (
                          <select
                            className="bg-white border border-outline-variant rounded-md px-2 py-1 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary max-w-[180px]"
                            value={selectedAlternatives[item.id] || item.suggested_rooms[0].room_code}
                            onChange={(e) => setSelectedAlternatives({ ...selectedAlternatives, [item.id]: e.target.value })}
                          >
                            {item.suggested_rooms.map((alt) => (
                              <option key={alt.room_code} value={alt.room_code}>
                                {alt.room_code} ({alt.capacity} seats, {alt.type})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[12px] text-gray-400 italic">No free rooms</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-5 py-4 text-right">
                        <button
                          disabled={!hasSuggestions || isWorking}
                          onClick={() => handleReassign(item)}
                          className="px-3 py-1.5 text-[12px] font-semibold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                          {isWorking ? 'Moving...' : 'Reassign'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}