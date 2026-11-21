import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({ full_name: 'Admin', email: 'admin@kca.ac.ke' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const navLinks = [
    { name: 'Master Timetable', path: '/timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Upload Data', path: '/upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { name: 'Validation Reports', path: '/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Facilities', path: '/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'User Management', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Version History', path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="min-h-screen bg-[#eaf1f5] font-sans flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-[#1f4153] text-white px-4 py-3 flex items-center z-30 shadow-md w-full gap-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-bold tracking-wide text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Room Allocation
        </Link>
      </div>

      {/* Mobile Background Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sticky Hover-Expand Sidebar (Dark Teal) */}
      <aside
        className={`group fixed inset-y-0 left-0 w-64 md:w-20 md:hover:w-64 bg-[#1f4153] z-50 transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 flex flex-col flex-shrink-0 overflow-hidden shadow-2xl md:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Dashboard/Home Header */}
        <div className="pt-8 px-6 pb-2 hidden md:block">
          <Link
            to="/"
            title="Room Allocation Dashboard"
            className={`flex items-center text-lg font-bold transition-colors ${
              location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
              Room Allocation
            </span>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="pt-6 pb-6 flex flex-col items-center border-b border-white/10 px-3">
          <div className="w-20 h-20 md:w-10 md:h-10 md:group-hover:w-20 md:group-hover:h-20 rounded-full border-2 md:group-hover:border-4 border-[#eaf1f5] overflow-hidden mb-2 md:mb-0 md:group-hover:mb-3 bg-white flex items-center justify-center transition-all duration-300 flex-shrink-0">
            <svg className="w-12 h-12 md:w-6 md:h-6 md:group-hover:w-12 md:group-hover:h-12 text-gray-400 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-center md:opacity-0 md:max-h-0 md:group-hover:opacity-100 md:group-hover:max-h-16 transition-all duration-300 overflow-hidden whitespace-nowrap">
            <h2 className="text-white font-semibold text-lg">{user.full_name.split(' ')[0]}</h2>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 pt-6 pl-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                title={link.name}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-l-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#eaf1f5] text-[#1f4153] relative'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-4 flex-shrink-0 ${isActive ? 'text-[#1f4153]' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                </svg>
                <span className="md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 mt-auto">
          <button
            title="Logout"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center text-gray-300 hover:text-white text-sm font-medium transition-colors w-full"
          >
            <svg className="w-5 h-5 mr-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#eaf1f5] p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}