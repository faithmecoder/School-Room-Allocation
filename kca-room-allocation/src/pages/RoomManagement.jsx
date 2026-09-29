import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({ room_code: '', room_type: 'PHYSICAL', capacity: 30 });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room_code.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/rooms/${editId}`, formData);
      } else {
        await axios.post('http://localhost:8000/api/rooms', formData);
      }
      
      // Reset form and refresh list
      setFormData({ room_code: '', room_type: 'PHYSICAL', capacity: 30 });
      setIsEditing(false);
      setEditId(null);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred while saving the room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setFormData({
      room_code: room.room_code,
      room_type: room.room_type,
      capacity: room.capacity
    });
    setEditId(room.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete ${code}? This action cannot be undone.`)) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert("Failed to delete room.");
    }
  };

  const cancelEdit = () => {
    setFormData({ room_code: '', room_type: 'PHYSICAL', capacity: 30 });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">Facility Management</h2>
        <p className="text-gray-600 text-[16px]">Add, update, or remove university lecture halls and laboratories.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">
              {isEditing ? 'Edit Facility' : 'Add New Facility'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Room Code</label>
                <input
                  type="text"
                  name="room_code"
                  placeholder="e.g., TC 2-3-2"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  value={formData.room_code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Facility Type</label>
                <select
                  name="room_type"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.room_type}
                  onChange={handleInputChange}
                >
                  <option value="PHYSICAL">Standard Lecture Room (PHYSICAL)</option>
                  <option value="LAB">Computer Laboratory (LAB)</option>
                  <option value="AMPHITHEATRE">Amphitheatre</option>
                  <option value="VIRTUAL">Virtual / Zoom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Seating Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Room' : 'Save Room'}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Room List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Campus Facilities Database</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                {rooms.length} Active Rooms
              </span>
            </div>
            
            <div className="overflow-x-auto">
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
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading facilities...</td>
                    </tr>
                  ) : rooms.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No facilities added yet. Use the form to add rooms.</td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-[14px] font-bold text-gray-800">{room.room_code}</td>
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
                          <button onClick={() => handleEdit(room)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-4">Edit</button>
                          <button onClick={() => handleDelete(room.id, room.room_code)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}