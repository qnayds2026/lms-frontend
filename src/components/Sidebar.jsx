import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Terminal,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  BarChart3,
  Settings,
  Video,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Videotape,
  X,
  LogOut,
} from "lucide-react";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// Role-specific nav configs — add/remove items here per role
const NAV_CONFIG = {
  admin: {
    home: "/admin/dashboard",
    label: "Admin",
    links: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Instructors", href: "/admin/instructors", icon: GraduationCap },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
    bottomLinks: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  instructor: {
    home: "/instructor/dashboard",
    label: "Instructor",
    links: [
      {
        label: "Dashboard",
        href: "/instructor/dashboard",
        icon: LayoutDashboard,
      },
      { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
      { label: "Students", href: "/instructor/my-students", icon: Users },
      { label: "Live Classes", href: "/instructor/live-classes", icon: Video },
      { label: "Recordings", href: "/instructor/recordings", icon: Videotape },
    ],
    bottomLinks: [
      { label: "Settings", href: "/instructor/settings", icon: Settings },
    ],
  },
};

export default function Sidebar({ role = "admin", user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const config = NAV_CONFIG[role] || NAV_CONFIG.admin;
  const isActive = (href) => location.pathname === href;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || config.label.slice(0, 2).toUpperCase();

  const NavItem = ({ href, label, icon: Icon }) => {
    const active = isActive(href);
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-sky-50 text-sky-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        } ${collapsed ? "justify-center" : ""}`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full bg-sky-600" />
        )}
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className={`flex items-center gap-2 px-4 h-16 border-b border-slate-100 shrink-0 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <Link to={config.home} className="flex items-center gap-2 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600">
            <Terminal className="h-4.5 w-4.5 text-white" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span
                className="block text-sm font-semibold text-slate-900 leading-none"
                style={display}
              >
                QNAYDS
              </span>
              <span
                className="block text-[10px] text-sky-600 uppercase tracking-wide mt-0.5"
                style={mono}
              >
                {config.label}
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {config.links.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </nav>

      {/* Bottom links + user */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1 shrink-0">
        {config.bottomLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}

        <div
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 mt-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
            style={display}
          >
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.name || config.label}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && onLogout && (
            <button
              onClick={onLogout}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-sky-600 hover:border-sky-300 shadow-sm transition"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block sticky shrink-0 border-r border-slate-200 bg-white h-screen top-0 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
