import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function DashboardLayout(){
    const [toggleSidebar, setToggleSidebar] = useState(true);
    
      return (
        <div className="flex h-screen bg-gray-100">
          <div
            className={`fixed top-0 left-0  bg-white shadow-lg transform transition-transform duration-300 z-50 ${
              toggleSidebar ? "translate-x-0" : "-translate-x-full"
            } w-64`}
          >
            <Sidebar />
          </div>
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              toggleSidebar ? "ml-64" : "ml-0"
            }`}
          >
            <Navbar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
            <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                <Outlet />
            </main>
          </div>
        </div>
    )
}