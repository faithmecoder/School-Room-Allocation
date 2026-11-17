import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadTimetable from './pages/UploadTimetable';
import ValidationReports from './pages/ValidationReports';
import RoomManagement from './pages/RoomManagement';
import VersionHistory from './pages/VersionHistory';
import UserManagement from './pages/UserManagement';
import StudentPortal from './pages/StudentPortal';


// 1. ADDED: Import the new MasterTimetable component
import MasterTimetable from './pages/MasterTimetable'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Active Application Routes */}
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadTimetable />} />
          <Route path="reports" element={<ValidationReports />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="history" element={<VersionHistory />} />
          <Route path="users" element={<UserManagement />} />

          <Route path="/portal" element={<StudentPortal />} />
          
          {/* UPDATED: Fixed path syntax for consistency */}
          <Route path="timetable" element={<MasterTimetable />} />
          
          {/* Simple Placeholders for remaining links */}
          <Route path="users" element={
            <div className="p-8"><h2 className="text-2xl font-bold text-on-surface">User Management</h2><p className="mt-2 text-on-surface-variant">Admin tools coming soon.</p></div>
          } />
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}