export default function RoomManagement() {
  const rooms = [
    { code: 'BLK-C-301', name: 'Lecture Hall 1', type: 'Lecture', capacity: 150, status: 'Active' },
    { code: 'MAC-LAB-1', name: 'Mac Computer Lab', type: 'Laboratory', capacity: 45, status: 'Active' },
    { code: 'MAIN-AUD', name: 'Main Auditorium', type: 'Auditorium', capacity: 500, status: 'Maintenance' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Room Management</h2>
          <p className="text-on-surface-variant text-[16px]">Manage university facilities, capacities, and resource types.</p>
        </div>
        <button className="bg-primary text-on-primary text-[14px] font-bold px-6 py-2.5 rounded-lg hover:bg-opacity-90 shadow-md transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add New Room
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room Code</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Room Name</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-4 text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rooms.map((room) => (
                <tr key={room.code} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-6 py-4 font-mono-sm text-[13px] font-bold text-on-surface">{room.code}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-on-surface-variant">{room.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-surface-container-high text-on-surface">
                      {room.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-on-surface-variant">{room.capacity} Seats</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
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