import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

// Public-facing nav links for the homepage
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  return (
    <header className="sticky top-0 z-50 w-full bg-[#ffffff]/95 backdrop-blur border-b border-slate-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0284c7]/10">
            <BookOpen className="h-5 w-5 text-[#0284c7]" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#0284c7]">
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
                    ? "text-[#0284c7]"
                    : "text-slate-500 hover:text-[#0284c7]"
                }`}
              >
                {link.label}
                {/* Signature: bookmark-tab indicator for the active section */}
                {isActive && (
                  <span className="absolute left-1/2 -bottom-[1px] h-[3px] w-6 -translate-x-1/2 rounded-full bg-[#0284c7]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-[#0284c7] rounded-md hover:bg-[#0284c7]/5 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-[#0284c7] rounded-md hover:bg-[#0369a1] transition-colors"
          >
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-[#0284c7] hover:bg-[#0284c7]/5"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-[#ffffff] px-4 py-3 space-y-1">
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
                    ? "bg-[#0284c7] text-white"
                    : "text-[#0284c7] hover:bg-[#0284c7]/5"
                }`}
              >
                {link.label}
              </a>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2 text-sm font-medium text-[#0284c7] border border-[#0284c7] rounded-md hover:bg-[#0284c7]/5 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-[#0284c7] rounded-md hover:bg-[#0369a1] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}