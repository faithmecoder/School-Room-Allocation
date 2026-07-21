export default function ValidationReports() {
  const conflicts = [
    { id: 'CONF-001', room: 'Block C - Room 302', course: 'Database Systems (BIT 201)', issue: 'Double Booking: Overlaps with BIT 204', severity: 'High' },
    { id: 'CONF-002', room: 'Main Hall', course: 'Software Engineering (BIT 203)', issue: 'Capacity Warning: 120 students in 100 capacity room', severity: 'Medium' },
    { id: 'CONF-003', room: 'Lab 4', course: 'Programming I (BIT 101)', issue: 'Resource Missing: Projector requested but not available', severity: 'Low' },
  ];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Validation Reports</h2>
          <p className="text-on-surface-variant text-[16px]">Review automated conflict detection results for your schedules.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest text-primary border border-primary/20 text-[14px] font-bold px-4 py-2.5 rounded-lg hover:bg-primary/5 shadow-sm transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <button className="bg-primary text-on-primary text-[14px] font-bold px-4 py-2.5 rounded-lg hover:bg-opacity-90 shadow-md transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Conflict ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room Allocation</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Course Module</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Issue Description</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {conflicts.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono-sm text-[13px] text-primary font-medium">{item.id}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-on-surface">{item.room}</td>
                  <td className="px-6 py-4 text-[14px] text-on-surface-variant">{item.course}</td>
                  <td className="px-6 py-4 text-[14px] text-on-surface-variant">{item.issue}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold border ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}