
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

export default function Layout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fall back to "student" if no user or role
  const role = user?.role === "admin" ? "admin" : "student";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-edusync-surface via-white to-edusync-surface/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
      {/* Enhanced background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,theme(colors.edusync.primary)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,theme(colors.edusync.accent)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar toggleSidebar={toggleSidebar} role={role} />
        <div className="flex flex-1 relative">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            ref={sidebarRef}
            role={role}
          />
          <main className={`flex-1 p-6 transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'lg:ml-0' : ''
          }`}>
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
