import { forwardRef, useEffect, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  User,
  BookOpen,
  CalendarDays,
  CreditCard,
  Users,
  Settings,
  FileQuestion,
  ClipboardList,
  BarChart2,
  X,
  ChevronDown,
  Home,
  UserCheck,
} from "lucide-react";
import { JSX } from "react/jsx-runtime";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: 1 | 2 | 3; // 1: Student, 2: Admin, 3: Instructor
}

interface MenuItem {
  label: string;
  path?: string;
  icon: JSX.Element;
  children?: MenuItem[];
  badge?: string;
}

const studentMenu: MenuItem[] = [
  { label: "Dashboard", path: "/student-dashboard", icon: <Home size={18} /> },
  { label: "Profile", path: "/profile", icon: <User size={18} /> },
  { 
    label: "Courses", 
    path: "/courses", 
    icon: <BookOpen size={18} />,
    badge: "Active"
  },
  { label: "Schedule", path: "/schedule", icon: <CalendarDays size={18} /> },
  {
    label: "Assignments",
    path: "/assignments",
    icon: <ClipboardList size={18} />,
  },
  {
    label: "Academic Records",
    path: "/academicRecords",
    icon: <BarChart2 size={18} />,
  },
];

const adminMenu: MenuItem[] = [
  { label: "Dashboard", path: "/admin-dashboard", icon: <Home size={18} /> },
  { label: "Profile", path: "/profile", icon: <User size={18} /> },
  {
    label: "Academic Records",
    path: "/admin/academic-records",
    icon: <BarChart2 size={18} />,
  },
  {
    label: "Course Management",
    path: "/admin/courses",
    icon: <BookOpen size={18} />,
  },
  {
    label: "Group Management",
    path: "/admin/groups",
    icon: <Users size={18} />,
  },
  {
    label: "User Management",
    path: "/admin/users",
    icon: <UserCheck size={18} />,
  },
];

const instructorMenu: MenuItem[] = [
  { label: "Dashboard", path: "/instructor-dashboard", icon: <Home size={18} /> },
  { label: "Profile", path: "/profile", icon: <User size={18} /> },
  {
    label: "My Groups",
    path: "/instructor/groups",
    icon: <Users size={18} />,
    badge: "Teaching"
  },
  {
    label: "Assignments",
    path: "/instructor/assignments",
    icon: <ClipboardList size={18} />,
  },
  {
    label: "Grading",
    path: "/instructor/grading",
    icon: <BarChart2 size={18} />,
  },
  {
    label: "Schedule",
    path: "/instructor/schedule",
    icon: <CalendarDays size={18} />,
  },
];

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ isOpen, onClose, role }, ref) => {
    const location = useLocation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (label: string) => {
      setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isGroupActive = useCallback(
      (group: MenuItem) =>
        group.children?.some((child) =>
          location.pathname.startsWith(child.path || "")
        ),
      [location.pathname]
    );

    useEffect(() => {
      const expanded: Record<string, boolean> = {};
      const menu = role === 2 ? adminMenu : role === 3 ? instructorMenu : studentMenu;

      menu.forEach((item) => {
        if (item.children && isGroupActive(item)) {
          expanded[item.label] = true;
        }
      });

      setOpenGroups((prev) => ({ ...prev, ...expanded }));
    }, [isGroupActive, location.pathname, role]);

    const menuItems = role === 2 ? adminMenu : role === 3 ? instructorMenu : studentMenu;
    const roleLabels = { 1: "Student", 2: "Admin", 3: "Instructor" };

    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />

        {/* Sidebar */}
        <div
          ref={ref}
          className={`fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-glass z-50 transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-edusync-primary/5 to-edusync-accent/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src="/favicon.ico" alt="Logo" className="h-10 w-10" />
                  <div className="absolute inset-0 bg-edusync-primary/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
                    EduSync
                  </span>
                  <p className="text-xs text-gray-500 capitalize">{roleLabels[role]} Portal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {menuItems.map((item, index) =>
                item.children ? (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(item.label)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                        isGroupActive(item)
                          ? "bg-gradient-to-r from-edusync-primary/10 to-edusync-accent/10 text-edusync-primary border border-edusync-primary/20"
                          : "text-gray-700 hover:bg-gray-50 hover:text-edusync-primary"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`transition-colors duration-200 ${
                          isGroupActive(item) ? "text-edusync-primary" : "text-gray-500 group-hover:text-edusync-primary"
                        }`}>
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs font-medium bg-edusync-primary/10 text-edusync-primary rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openGroups[item.label] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    
                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      openGroups[item.label] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      <div className="ml-6 space-y-1 pt-1">
                        {item.children.map((sub, subIndex) => (
                          <NavLink
                            key={sub.label}
                            to={sub.path!}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group ${
                                isActive
                                  ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg transform scale-105"
                                  : "text-gray-600 hover:bg-edusync-primary/5 hover:text-edusync-primary hover:translate-x-1"
                              }`
                            }
                            style={{ animationDelay: `${(index + subIndex) * 50}ms` }}
                          >
                            <span className="text-current opacity-70">
                              {sub.icon}
                            </span>
                            <span className="font-medium text-sm">{sub.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.path!}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg transform scale-105"
                          : "text-gray-700 hover:bg-gray-50 hover:text-edusync-primary hover:translate-x-1"
                      }`
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className={`transition-colors duration-200 ${
                      location.pathname === item.path ? "text-white" : "text-gray-500 group-hover:text-edusync-primary"
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ml-auto ${
                        location.pathname === item.path 
                          ? "bg-white/20 text-white" 
                          : "bg-edusync-primary/10 text-edusync-primary"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                © 2024 EduSync Platform
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Version 2.0
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";
export default Sidebar;
