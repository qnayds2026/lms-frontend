import { useState } from "react";
import {
  Menu,
  X,
  Terminal,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };

const NAV_LINKS = [
  { label: "Dashboard", href: "/student/dashboard" },
  { label: "My Courses", href: "/student/my-courses" },
  { label: "Live Classes", href: "/student/live-classes" },
  { label: "Notifications", href: "/student/notifications" },
];

export default function StudentNavbar({ user, unreadCount = 0, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => location.pathname === href;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <style>{FONT_IMPORT}</style>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link
          to="/student/dashboard"
          className="flex items-center gap-2 shrink-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600">
            <Terminal className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          </span>
          <span
            className="text-lg font-semibold tracking-tight text-slate-900"
            style={display}
          >
            QNAYDS
          </span>
        </Link>

        {/* Right: notifications + profile */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/student/notifications"
            className="relative flex items-center justify-center h-9 w-9 rounded-md text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
                style={display}
              >
                {initials}
              </span>
              <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                {user?.name || "Student"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
                <Link
                  to="/student/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/student/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-sky-600 hover:bg-sky-50"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-sky-600 text-white"
                    : "text-sky-600 hover:bg-sky-50"
                }`}
              >
                {link.label}
                {link.label === "Notifications" && unreadCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-200 flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
              style={display}
            >
              {initials}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                {user?.name || "Student"}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout?.();
              }}
              className="flex items-center justify-center h-9 w-9 rounded-md text-red-500 hover:bg-red-50"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}