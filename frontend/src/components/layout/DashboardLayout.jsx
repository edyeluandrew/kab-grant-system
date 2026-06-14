import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ role = 'applicant', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden fixed w-full">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar role={role} onNavClick={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 bg-background overflow-y-auto w-full">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
