// kca-room-allocation/src/pages/RoomManagement.jsx
import React, { useState, useEffect } from 'react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ room_code: '', capacity: '', room_type: 'Lecture Hall' });
  const [error, setError] = useState('');

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rooms/');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/rooms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: formData.room_code,
          capacity: parseInt(formData.capacity),
          room_type: formData.room_type
        })
      });

      if (response.ok) {
        setFormData({ room_code: '', capacity: '', room_type: 'Lecture Hall' });
        fetchRooms(); // Refresh the table
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Failed to add room');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/rooms/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error("Failed to delete room", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Room Management</h1>
      
      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Room</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Code (e.g., LAB 1)</label>
            <input type="text" name="room_code" value={formData.room_code} onChange={handleChange} required className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select name="room_type" value={formData.room_type} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 bg-white">
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Virtual">Virtual (Zoom)</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Save Room
          </button>
        </form>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No rooms added yet.</td></tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{room.room_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {room.room_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}