import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/UploadTimetable';
import MasterTimetable from './pages/MasterTimetable';
import ValidationReports from './pages/ValidationReports';
import RoomManagement from './pages/RoomManagement';
import UserManagement from './pages/UserManagement';
import VersionHistory from './pages/VersionHistory';
import StudentPortal from './pages/StudentPortal';
import Login from './pages/Login';

// Safer ProtectedRoute that catches JSON errors
const ProtectedRoute = ({ children, allowedRoles }) => {
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Session error, forcing logout.");
    localStorage.removeItem('user');
  }

  // If no user is logged in, kick them to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a student/lecturer tries to access an Admin page, kick them to the portal
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Read-Only Portal for Students & Lecturers */}
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute allowedRoles={['CLASS_REP', 'LECTURER', 'TIMETABLE_OFFICER']}>
              <StudentPortal />
            </ProtectedRoute>
          } 
        />

        {/* Locked Admin Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['TIMETABLE_OFFICER']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<DataUpload />} />
          <Route path="timetable" element={<MasterTimetable />} />
          <Route path="reports" element={<ValidationReports />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="history" element={<VersionHistory />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}