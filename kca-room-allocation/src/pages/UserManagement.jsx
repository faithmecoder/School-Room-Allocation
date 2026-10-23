import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ full_name: '', email: '', role: 'CLASS_REP', cohort: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/users', formData);
      setFormData({ full_name: '', email: '', role: 'CLASS_REP', cohort: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred adding the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    try {
      await axios.delete(`http://localhost:8000/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">User Management</h2>
          <p className="text-gray-600 text-[16px]">Provision accounts for Timetable Officers and Cohort Class Reps.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Registration Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">Register New User</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Email Address</label>
                <input type="email" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Role</label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="CLASS_REP">Class Representative</option>
                  <option value="TIMETABLE_OFFICER">Timetable Officer (Admin)</option>
                </select>
              </div>

              {formData.role === 'CLASS_REP' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Assigned Cohort</label>
                  <input type="text" placeholder="e.g., BSD FT 3.1" className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm uppercase" value={formData.cohort} onChange={e => setFormData({...formData, cohort: e.target.value})} required />
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        {/* User Directory */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">System Access Directory</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Role & Cohort</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No users registered yet.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-bold text-gray-800">{user.full_name}</div>
                          <div className="text-[12px] text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                            user.role === 'TIMETABLE_OFFICER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                          {user.cohort !== 'ALL' && <div className="text-[12px] font-semibold text-gray-600 mt-1 mt-1">Cohort: {user.cohort}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(user.id, user.full_name)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Revoke Access</button>
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