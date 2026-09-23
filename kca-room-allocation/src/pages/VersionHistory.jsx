import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VersionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [versionName, setVersionName] = useState('');
  
  // Modal State
  const [reportData, setReportData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const navigate = useNavigate();

  const fetchHistory = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/versions')
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch versions", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    setIsSaving(true);
    try {
      await axios.post('http://localhost:8000/api/versions/snapshot', { version_name: versionName });
      setVersionName('');
      fetchHistory(); 
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create snapshot.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (versionId, vName) => {
    const confirmRestore = window.confirm(
      `CRITICAL WARNING: Are you sure you want to restore "${vName}"?\n\nThis will overwrite your current active timetable. Ensure you have saved your current progress as a snapshot first.`
    );
    if (!confirmRestore) return;

    try {
      const response = await axios.post(`http://localhost:8000/api/versions/${versionId}/restore`);
      alert(response.data.message || "Timetable successfully restored!");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to restore this version.");
    }
  };

  const handleDownload = (versionId) => {
    window.location.href = `http://localhost:8000/api/versions/${versionId}/export`;
  };

  const handleViewReport = async (versionId) => {
    setIsModalOpen(true);
    setReportLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/versions/${versionId}/stats`);
      setReportData(response.data);
    } catch (err) {
      alert("Failed to load report data.");
      setIsModalOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="animate-fade-in p-6 max-w-6xl mx-auto relative">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-gray-800 mb-2 tracking-tight">Version History</h2>
        <p className="text-gray-600 text-[16px]">Create backup snapshots, view historical reports, or download past drafts.</p>
      </div>

      {/* Snapshot Creation Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Save Current State</h3>
        <form onSubmit={handleCreateSnapshot} className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Version Name / Description</label>
            <input
              type="text"
              placeholder="e.g., Draft 2 - Post IT Dept Review"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>
          <button type="submit" disabled={isSaving || !versionName.trim()} className="px-6 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            {isSaving ? 'Creating Snapshot...' : 'Save Version Snapshot'}
          </button>
        </form>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">Saved Archives</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading version history...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No snapshots have been saved yet.</div>
          ) : (
            history.map((version) => (
              <div key={version.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{version.version_name}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{formatDate(version.created_at)}</span>
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>{version.total_classes} Classes</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleViewReport(version.id)} className="text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded border border-indigo-200 transition-colors">
                    View Report
                  </button>
                  <button onClick={() => handleDownload(version.id)} className="text-sm font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 transition-colors">
                    Download Excel
                  </button>
                  <button onClick={() => handleRestore(version.id, version.version_name)} className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded border border-red-200 transition-colors">
                    Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Modal Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">
                Utilization Report: {reportData?.version_name || "Loading..."}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {reportLoading ? (
                <div className="text-center py-12 text-gray-500">Calculating historical stats...</div>
              ) : reportData ? (
                <div>
                  {/* Metric Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Classes</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.total_classes}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cohorts</p>
                      <p className="text-2xl font-bold text-blue-600">{reportData.total_cohorts}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Rooms Used</p>
                      <p className="text-2xl font-bold text-emerald-600">{reportData.total_rooms}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-500 font-bold uppercase mb-1">Utilization</p>
                      <p className="text-2xl font-bold text-indigo-700">{reportData.utilization_rate}%</p>
                    </div>
                  </div>

                  {/* Room List */}
                  <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Room Booking Volume</h4>
                  <div className="space-y-4">
                    {reportData.top_utilized_rooms.length === 0 ? (
                      <p className="text-gray-500 text-sm">No physical rooms in this version.</p>
                    ) : (
                      reportData.top_utilized_rooms.map(room => {
                        const pct = Math.min((room.classes / 20) * 100, 100);
                        return (
                          <div key={room.room}>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-sm font-semibold text-gray-700">{room.room}</span>
                              <span className="text-xs font-medium text-gray-500">{room.classes} slots filled</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold text-sm hover:bg-gray-300 transition-colors">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}