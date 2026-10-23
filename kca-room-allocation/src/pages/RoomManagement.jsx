import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Facility Form State
  const [newRoom, setNewRoom] = useState({ room_code: '', room_type: 'PHYSICAL', capacity: 30 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Edit State
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ room_type: '', capacity: '' });

  const fetchRooms = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/rooms')
      .then(res => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch rooms", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.room_code.trim()) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/rooms', newRoom);
      setNewRoom({ room_code: '', room_type: 'PHYSICAL', capacity: 30 });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineEditStart = (room) => {
    setEditId(room.id);
    setEditData({ room_type: room.room_type, capacity: room.capacity });
  };

  const handleInlineEditSave = async (id, roomCode) => {
    try {
      await axios.put(`http://localhost:8000/api/rooms/${id}`, {
        room_code: roomCode, // code remains unchanged
        room_type: editData.room_type,
        capacity: parseInt(editData.capacity)
      });
      setEditId(null);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update room.");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete ${code}?`)) return;
    try {
      await axios.delete(`http://localhost:8000/api/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert("Failed to delete room.");
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">Facility Management</h2>
        <p className="text-gray-600 text-[16px]">Manage university lecture halls and their seating capacities.</p>
      </div>

      {/* Add New Room Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleAddSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">New Room Code</label>
            <input type="text" placeholder="e.g. TC 2-3-2" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase" value={newRoom.room_code} onChange={e => setNewRoom({...newRoom, room_code: e.target.value})} required />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Facility Type</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={newRoom.room_type} onChange={e => setNewRoom({...newRoom, room_type: e.target.value})}>
              <option value="PHYSICAL">PHYSICAL</option>
              <option value="LAB">LAB</option>
              <option value="AMPHITHEATRE">AMPHITHEATRE</option>
              <option value="VIRTUAL">VIRTUAL</option>
            </select>
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Capacity</label>
            <input type="number" min="1" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} required />
          </div>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 h-[38px]">
            {isSubmitting ? 'Adding...' : '+ Add Facility'}
          </button>
        </form>
      </div>

      {/* Room List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Campus Facilities Database</h3>
          
          {/* Refresh Icon Button */}
          <button onClick={fetchRooms} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Refresh List">
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
        
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Room Code</th>
              <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-[14px] font-bold text-gray-800">{room.room_code}</td>
                
                {/* Inline Edit Logic */}
                {editId === room.id ? (
                  <>
                    <td className="px-6 py-3">
                      <select className="border border-blue-400 rounded px-2 py-1 text-sm w-full" value={editData.room_type} onChange={e => setEditData({...editData, room_type: e.target.value})}>
                        <option value="PHYSICAL">PHYSICAL</option>
                        <option value="LAB">LAB</option>
                        <option value="AMPHITHEATRE">AMPHITHEATRE</option>
                        <option value="VIRTUAL">VIRTUAL</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input type="number" min="1" className="border border-blue-400 rounded px-2 py-1 text-sm w-24" value={editData.capacity} onChange={e => setEditData({...editData, capacity: e.target.value})} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleInlineEditSave(room.id, room.room_code)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold mr-2">Save</button>
                      <button onClick={() => setEditId(null)} className="text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs font-bold">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                        room.room_type === 'LAB' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        room.room_type === 'VIRTUAL' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {room.room_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-gray-600">{room.capacity} Seats</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleInlineEditStart(room)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-4">Edit</button>
                      <button onClick={() => handleDelete(room.id, room.room_code)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}