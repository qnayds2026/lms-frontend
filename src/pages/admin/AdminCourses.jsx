import { useEffect, useState } from "react";
import { Search, BookOpen, Terminal } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function RowSkeleton() {
  return (
    <tr className="border-t border-slate-100">
      <td colSpan={5} className="px-5 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse" />
      </td>
    </tr>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | published | draft

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/courses");
        setCourses(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesQuery =
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && c.isPublished) ||
      (statusFilter === "draft" && !c.isPublished);
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> courses
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
        Courses
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        All courses across every instructor, published and draft.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or instructor..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {["all", "published", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider capitalize transition-colors ${
                statusFilter === s
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={mono}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wider" style={mono}>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}

              {!loading &&
                filtered.map((course) => (
                  <tr
                    key={course.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <BookOpen size={14} />
                        </span>
                        <span className="font-medium text-slate-900">
                          {course.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {course.instructor?.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-700" style={mono}>
                      {formatINR(course.price)}
                    </td>
                    <td className="px-5 py-3 text-slate-700" style={mono}>
                      {course._count?.enrollments ?? 0}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          course.isPublished
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No courses match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}