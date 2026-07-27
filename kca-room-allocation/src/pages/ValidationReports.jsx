import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValidationReports() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/conflicts')
      .then(res => {
        setConflicts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch conflicts", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Validation Reports</h2>
          <p className="text-on-surface-variant text-[16px]">Automated conflict detection pulled directly from your master timetable.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room Code</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Conflicting Units</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Issue Description</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">Scanning database for conflicts...</td></tr>
              ) : conflicts.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-green-700 font-medium">No scheduling conflicts detected in the uploaded file!</td></tr>
              ) : (
                conflicts.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4 font-mono-sm text-[13px] text-primary font-medium">{item.id}</td>
                    <td className="px-6 py-4 text-[14px] font-medium text-on-surface">{item.room}</td>
                    <td className="px-6 py-4 text-[14px] text-on-surface-variant">{item.course}</td>
                    <td className="px-6 py-4 text-[14px] text-on-surface-variant">{item.issue}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold border bg-red-100 text-red-700 border-red-200">
                        {item.severity}
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