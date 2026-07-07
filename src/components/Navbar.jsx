import { useState } from "react";
import { Menu, X, BookOpen, ChevronDown } from "lucide-react";

// Update these to match your routing setup (e.g. React Router <Link to="">)
const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Courses", href: "/courses" },
  { label: "Assignments", href: "/assignments" },
];


function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}


export default function Navbar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Dashboard");

  const displayName = user?.name || "Guest";
  const initials = getInitials(displayName) || "?";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAF8]/95 backdrop-blur border-b border-[#1B2A4A]/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B2A4A]">
            <BookOpen className="h-5 w-5 text-[#E8A33D]" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1B2A4A]">
            Qnayds
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive
                    ? "text-[#1B2A4A]"
                    : "text-[#5B6472] hover:text-[#1B2A4A]"
                }`}
              >
                {link.label}
                {/* Signature: bookmark-tab indicator for the active section */}
                {isActive && (
                  <span className="absolute left-1/2 -bottom-[1px] h-[3px] w-6 -translate-x-1/2 rounded-full bg-[#E8A33D]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: profile */}
        <div className="hidden md:flex items-center gap-3 relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-[#1B2A4A]/5 transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A33D] text-sm font-semibold text-[#1B2A4A]">
              {initials}
            </span>
            <ChevronDown className="h-4 w-4 text-[#5B6472]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-44 rounded-lg border border-[#1B2A4A]/10 bg-white shadow-lg py-1">
              <a href="/profile" className="block px-4 py-2 text-sm text-[#1B2A4A] hover:bg-[#FAFAF8]">
                Your Profile
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-[#1B2A4A] hover:bg-[#FAFAF8]">
                Settings
              </a>
              <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-[#FAFAF8]">
                Sign out
              </a>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1B2A4A]/10 bg-[#FAFAF8] px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.label);
                  setMobileOpen(false);
                }}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-[#1B2A4A] text-white"
                    : "text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-2 mt-2 border-t border-[#1B2A4A]/10 flex items-center gap-2 px-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A33D] text-sm font-semibold text-[#1B2A4A]">
              {initials}
            </span>
            <span className="text-sm text-[#5B6472]">{displayName}</span>
          </div>
        </div>
      )}
    </header>
  );
}
