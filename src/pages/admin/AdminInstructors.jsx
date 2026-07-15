import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserCog, Terminal, ChevronRight } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-36 animate-pulse" />
  );
}

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchInstructors() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/instructors");
        setInstructors(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load instructors.");
      } finally {
        setLoading(false);
      }
    }
    fetchInstructors();
  }, []);

  const filtered = instructors.filter(
    (i) =>
      i.name?.toLowerCase().includes(query.toLowerCase()) ||
      i.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> instructors
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
        Instructors
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        Everyone with instructor access, and what they've built.
      </p>

      {/* Search */}
      <div className="relative max-w-sm mt-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 placeholder:text-slate-400"
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Grid of instructor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {loading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}

        {!loading &&
          filtered.map((inst) => (
            <Link
              key={inst.id}
              to={`/admin/instructors/${inst.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-semibold shrink-0" style={display}>
                  {inst.name?.charAt(0)?.toUpperCase() || <UserCog size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {inst.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{inst.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.totalCourses}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Courses
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.publishedCourses}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Live
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.totalStudents}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Students
                  </p>
                </div>
              </div>
            </Link>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No instructors match your search.
          </div>
        )}
      </div>
    </div>
  );
}