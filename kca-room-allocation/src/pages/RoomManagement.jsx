// src/pages/RoomManagement.jsx
import React, { useState, useEffect } from 'react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  

  // Form state for adding new room manually
  const [formData, setFormData] = useState({
    room_code: '',
    capacity: '',
    room_type: 'Lecture Hall'
  });

  // State for row currently being edited inline
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ capacity: '', room_type: 'Lecture Hall' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/rooms/');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        setError('Failed to fetch rooms from backend.');
      }
    } catch (err) {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRooms = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/rooms/sync', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        fetchRooms();
      }
    } catch (err) {
      alert('Failed to sync rooms from database.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/rooms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: formData.room_code.trim(),
          capacity: parseInt(formData.capacity, 10),
          room_type: formData.room_type
        })
      });

      if (res.ok) {
        setFormData({ room_code: '', capacity: '', room_type: 'Lecture Hall' });
        fetchRooms();
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to add room.');
      }
    } catch (err) {
      setError('Network error while adding room.');
    }
  };

  const startEdit = (room) => {
    setEditingId(room.id);
    setEditFields({
      capacity: room.capacity === 0 ? '' : room.capacity,
      room_type: room.room_type === 'Pending' ? 'Lecture Hall' : room.room_type
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({ capacity: '', room_type: 'Lecture Hall' });
  };

  const handleSaveEdit = async (id) => {
    if (!editFields.capacity || parseInt(editFields.capacity, 10) <= 0) {
      alert('Please enter a valid capacity greater than 0.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacity: parseInt(editFields.capacity, 10),
          room_type: editFields.room_type
        })
      });

      if (res.ok) {
        setEditingId(null);
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to update room.');
      }
    } catch (err) {
      alert('Network error while updating room.');
    }
  };

  const handleDelete = async (id, roomCode) => {
    if (!window.confirm(`Are you sure you want to delete "${roomCode}"?`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/rooms/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRooms(rooms.filter((r) => r.id !== id));
      } else {
        alert('Failed to delete room.');
      }
    } catch (err) {
      alert('Network error while deleting room.');
    }
  };

  const filteredRooms = rooms.filter((r) =>
    r.room_code.toLowerCase().includes(search.toLowerCase())
  );

const [bulkUploading, setBulkUploading] = useState(false);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setBulkUploading(true);
    try {
      const res = await fetch("http://localhost:8000/api/rooms/bulk-upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchRooms(); // Refresh room listing
      } else {
        alert(data.detail || "Bulk upload failed.");
      }
    } catch (err) {
      alert("Failed to upload rooms file.");
    } finally {
      setBulkUploading(false);
      e.target.value = ""; // Reset input
    }
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
     {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Room Management</h1>
          <p className="text-sm text-gray-500">Configure lecture hall capacities and facility types.</p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Hidden File Input */}
          <input
            type="file"
            id="bulk-room-input"
            accept=".csv, .xlsx"
            className="hidden"
            onChange={handleBulkUpload}
          />
          <label
            htmlFor="bulk-room-input"
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-colors ${
              bulkUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {bulkUploading ? "Uploading..." : "Import CSV/Excel"}
          </label>

          <button
            onClick={handleSyncRooms}
            className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            Sync Missing Rooms from Database
          </button>
        </div>
      </div>

      {/* Add Room Card */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Add New Room Manually</h2>
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">{error}</div>}

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Room Code</label>
            <input
              type="text"
              placeholder="e.g., LAB 1"
              value={formData.room_code}
              onChange={(e) => setFormData({ ...formData, room_code: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              placeholder="e.g., 60"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
            <select
              value={formData.room_type}
              onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Virtual">Virtual (Zoom)</option>
              <option value="Amphitheatre">Amphitheatre</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            Save Room
          </button>
        </form>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Filter by room code (e.g. LAB, RM)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredRooms.length} of {rooms.length} facilities
        </span>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr><td colSpan="4" className="px-5 py-6 text-center text-gray-400">Loading rooms...</td></tr>
            ) : filteredRooms.length === 0 ? (
              <tr><td colSpan="4" className="px-5 py-6 text-center text-gray-400">No matching rooms found.</td></tr>
            ) : (
              filteredRooms.map((room) => {
                const isEditing = editingId === room.id;
                return (
                  <tr key={room.id} className={room.capacity === 0 ? "bg-amber-50/40" : "hover:bg-gray-50"}>
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {room.room_code}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          className="w-24 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none ring-2 ring-blue-100"
                          value={editFields.capacity}
                          onChange={(e) => setEditFields({ ...editFields, capacity: e.target.value })}
                        />
                      ) : room.capacity === 0 ? (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Needs Capacity</span>
                      ) : (
                        <span className="text-gray-700 font-medium">{room.capacity} seats</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          className="border border-blue-400 rounded px-2 py-1 text-sm bg-white focus:outline-none"
                          value={editFields.room_type}
                          onChange={(e) => setEditFields({ ...editFields, room_type: e.target.value })}
                        >
                          <option value="Lecture Hall">Lecture Hall</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Amphitheatre">Amphitheatre</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            room.room_type === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : room.room_type === 'Laboratory'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {room.room_type}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-medium space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(room.id)}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(room)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => handleDelete(room.id, room.room_code)}
                            className="text-rose-600 hover:text-rose-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}