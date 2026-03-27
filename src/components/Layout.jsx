import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Users, GraduationCap, IndianRupee, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Teachers', path: '/teachers', icon: <Users className="w-5 h-5" /> },
    { name: 'Students', path: '/students', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Fees', path: '/fees', icon: <IndianRupee className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <LayoutDashboard className="w-6 h-6" />
            <span>AbacusAdmin</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-10 hidden md:flex">
          <h2 className="text-xl font-semibold text-gray-800">Institute Management</h2>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
