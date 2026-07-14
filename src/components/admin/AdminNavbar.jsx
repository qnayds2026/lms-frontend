import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Phone,
  Bell,
  Pencil,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: " Courses", href: "/admin/courses" },
  { label: "Instructors", href: "/admin/instructors" },
  { label: " Payments", href: "/admin/payments" },
  { label: " Live Classes", href: "/instructor/live-classes" },
];

export default function AdminNavbar({
  unreadCount = 0,
  onLogout,
  onMenuClick,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [notification, setNotification] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href) => location.pathname === href;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/user/me");

        setUser(res.data.data);
        console.log(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotification(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const unreadNotifications = notification.filter(
    (item) => !item.isRead,
  ).length;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
        <style>{FONT_IMPORT}</style>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-semibold text-slate-900"
              style={display}
            >
              Admin Dashboard
            </h1>
          </div>

          {/* Right: notifications + profile */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setShowNotification((v) => !v)}
              className="relative flex items-center justify-center h-9 w-9 rounded-md text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

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
                <span className="text-sm font-medium text-slate-700 max-w-25 truncate">
                  {user?.name || "Student"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowProfileDrawer(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
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
                  handleLogout();
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
      {showProfileDrawer && (
        <div className="fixed inset-0 z-100">
          <style>{`
      @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
    `}</style>

          <div
            className="absolute inset-0 bg-black/40"
            style={{ animation: "backdropFadeIn 200ms ease-out" }}
            onClick={() => setShowProfileDrawer(false)}
          />

          <div
            className="absolute right-0 top-0 h-full w-full sm:w-95 max-w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            style={{
              animation: "drawerSlideIn 280ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
              <h2
                className="text-lg sm:text-xl font-semibold text-slate-900"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                My Profile
              </h2>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable if content grows */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-semibold ring-4 ring-sky-50">
                  {initials}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {user?.name}
                </h3>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Role</p>
                    <p className="font-medium text-slate-800 truncate">
                      {user?.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Phone className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800 truncate">
                      {user?.phone || "Not added"}
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-medium transition inline-flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="mt-3 w-full border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
            
          </div>
        </div>
      )}
      {showNotification && (
        <div className="fixed inset-0 z-100">
          <style>{`
      @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
    `}</style>

          <div
            className="absolute inset-0 bg-black/30"
            style={{ animation: "backdropFadeIn 200ms ease-out" }}
            onClick={() => setShowNotification(false)}
          />

          <div
            className="absolute right-0 top-0 h-full w-full sm:w-100 max-w-full bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            style={{
              animation: "drawerSlideIn 280ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                  <Bell className="w-4 h-4 text-sky-600" />
                </span>
                <h2
                  className="text-lg sm:text-xl font-semibold text-slate-900"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Notifications
                </h2>
              </div>

              <button
                onClick={() => setShowNotification(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notification.length === 0 ? (
                <div className="p-10 sm:p-14 text-center">
                  <Bell className="w-9 h-9 mx-auto text-slate-300" />
                  <p className="mt-4 text-sm text-slate-400">
                    No notifications
                  </p>
                </div>
              ) : (
                notification.map((item) => (
                  <div
                    key={item.id}
                    className={`px-5 sm:px-6 py-4 border-b border-slate-100 transition ${
                      item.isRead === false
                        ? "bg-sky-50/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {item.isRead === false && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900 text-sm leading-snug wrap-break-words">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 wrap-break-words">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
