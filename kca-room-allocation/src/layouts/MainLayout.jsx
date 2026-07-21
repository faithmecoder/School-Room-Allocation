import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function MainLayout() {
  const location = useLocation();
  // State to control the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Upload Timetable', path: '/upload', icon: 'upload_file' },
    { name: 'Validation Reports', path: '/reports', icon: 'assessment' },
    { name: 'Room Management', path: '/rooms', icon: 'meeting_room' },
    { name: 'User Management', path: '/users', icon: 'group' },
    { name: 'Version History', path: '/history', icon: 'history' },
  ];

  // Helper to close the menu when a link is clicked on mobile
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-background text-on-surface font-body-lg min-h-screen antialiased flex overflow-hidden">
      
      {/* Mobile Dark Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar - Now responsive with slide-in animation */}
      <nav className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_4px_20px_rgba(15,76,129,0.05)] flex flex-col py-stack-lg z-30 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="px-gutter mb-8 flex flex-col gap-2">
          <h1 className="font-title-md text-[20px] font-bold text-primary">KCA University</h1>
          <p className="font-body-sm text-[14px] text-on-surface-variant">Room Allocation System</p>
        </div>
        
        <div className="px-gutter mb-8">
          <button className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-md text-[14px] hover:bg-opacity-90 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Allocation
          </button>
        </div>

        <ul className="flex flex-col gap-1 flex-grow overflow-y-auto w-full px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body-lg text-[15px]">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-1 w-full pt-4 border-t border-outline-variant/10 px-4">
          <Link to="#" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-lg text-[15px]">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-grow flex flex-col md:ml-[260px] min-h-screen w-full relative overflow-y-auto">
        
        {/* TopAppBar - Added Hamburger Menu for Mobile */}
        <header className="fixed top-0 right-0 left-0 md:left-[260px] h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex justify-between items-center px-4 md:px-8 w-full md:w-[calc(100%-260px)] z-10">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <span className="font-title-md text-[18px] font-bold text-primary">RAS</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="text-on-surface-variant hover:bg-surface-container-high/50 rounded-full p-2 transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px] shadow-sm group-hover:bg-primary transition-colors">
                FN
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="text-[14px] font-bold text-on-surface">softwareDevQueen</span>
                <span className="text-[12px] text-primary hover:underline">Logout</span>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas - Adjusted padding for mobile */}
        <main className="flex-grow p-4 md:p-8 mt-16 max-w-container-max mx-auto w-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}