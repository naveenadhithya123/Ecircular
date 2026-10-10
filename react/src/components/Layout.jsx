import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, LayoutDashboard, FileCheck } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role') || 'staff';

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/${role}/dashboard`} className="font-bold text-xl flex items-center gap-2">
              <span className="bg-white text-blue-900 px-2 py-1 rounded font-black text-sm">EC</span>
              E-Circular System
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-4 text-sm font-medium">
            <Link 
              to={`/${role}/dashboard`} 
              className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-800 ${location.pathname.includes('dashboard') ? 'bg-blue-800' : ''}`}
            >
              <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link 
              to="/approved" 
              className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-800 ${location.pathname.includes('approved') ? 'bg-blue-800' : ''}`}
            >
              <FileCheck size={16} /> <span className="hidden sm:inline">Approved Documents</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-800 ${location.pathname.includes('settings') ? 'bg-blue-800' : ''}`}
            >
              <Settings size={16} /> <span className="hidden sm:inline">Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-800 text-red-200"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
