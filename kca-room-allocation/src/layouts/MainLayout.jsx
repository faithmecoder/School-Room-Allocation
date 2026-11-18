import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Master Timetable', path: '/timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Upload Data', path: '/upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { name: 'Validation Reports', path: '/reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { name: 'Facilities', path: '/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'User Management', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Version History', path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-30 shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <Link 
          to="/" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-lg font-extrabold text-blue-900 tracking-tight hover:text-blue-700 transition-colors"
        >
          Room Allocation System
        </Link>
      </div>

      {/* Mobile Background Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Fixed on Desktop, Slide-out on Mobile) */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header / Branding */}
        <div className="h-20 hidden md:flex items-center px-8 border-b border-gray-100">
          <Link to="/" className="text-xl font-extrabold text-blue-900 tracking-tight hover:text-blue-700 transition-colors w-full block">
            Room Allocation System
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-5rem)] flex flex-col">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">Menu</div>
          
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`mr-4 p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-100/50 text-blue-600' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                  </svg>
                </div>
                {link.name}
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                )}
              </Link>
            );
          })}

          {/* Logout Button at the bottom of the sidebar */}
          <div className="mt-auto pt-8">
            <button 
              onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} 
              className="flex justify-center items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-72 flex flex-col min-h-screen">
        <div className="flex-1 w-full max-w-full">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}