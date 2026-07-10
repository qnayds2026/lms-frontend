import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Terminal, Filter, ChevronRight } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const PAGE_SIZE = 10;

const InstructorMyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/enrollments/my-students");
        setStudents(res.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Reset to page 1 whenever the filter changes, so you don't land on an empty page
  useEffect(() => {
    setPage(1);
  }, [courseFilter]);

  // Unique list of courses present in the student data, for the filter dropdown
  const courseOptions = useMemo(() => {
    const seen = new Map();
    students.forEach((s) => {
      if (s.course?.id) seen.set(s.course.id, s.course.title);
    });
    return Array.from(seen, ([id, title]) => ({ id, title }));
  }, [students]);

  const filtered = useMemo(() => {
    return courseFilter === "all"
      ? students
      : students.filter((s) => String(s.course?.id) === String(courseFilter));
  }, [students, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <Link
        to="/instructor/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            <Terminal className="w-3.5 h-3.5" /> my_students
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900" style={display}>
            My Students
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading..." : `${filtered.length} of ${students.length} students`}
          </p>
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            disabled={loading || courseOptions.length === 0}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All courses</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase"
                  style={mono}
                >
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{enrollment.student?.name}</p>
                      <p className="text-xs text-slate-400">{enrollment.student?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{enrollment.course?.title}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-medium text-slate-400 uppercase"
                        style={mono}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400" style={mono}>
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">
            {students.length === 0
              ? "No students enrolled yet."
              : "No students match this filter."}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorMyStudents;