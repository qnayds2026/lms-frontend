import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, CheckCircle2, AlertCircle, Terminal, ArrowRight } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING", label: "Pending" },
  { key: "COMPLETED", label: "Completed" },
];

function StatusIcon({ status }) {
  if (status === "COMPLETED") return <CheckCircle2 className="w-5 h-5 text-sky-600" />;
  if (status === "PENDING") return <AlertCircle className="w-5 h-5 text-amber-500" />;
  return <PlayCircle className="w-5 h-5 text-sky-600" />;
}

function CourseRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-20 animate-pulse" />
  );
}

const StudentMyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchMyCourses() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/enrollments/my-courses");
        setEnrollments(res.data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load your courses. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  const getCourse = (item) => item.course || item;
  const getCourseId = (item) => item.course?.id ?? item.courseId ?? item.id;
  const getStatus = (item) => item.status || "ACTIVE";

  const filtered =
    filter === "all"
      ? enrollments
      : enrollments.filter((item) => getStatus(item) === filter);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> my_courses
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
        My Courses
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        {loading ? "Loading..." : `${enrollments.length} courses enrolled`}
      </p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filter === f.key
                ? "bg-sky-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading &&
          [0, 1, 2].map((i) => <CourseRowSkeleton key={i} />)}

        {!loading &&
          !error &&
          filtered.map((item) => {
            const course = getCourse(item);
            const courseId = getCourseId(item);
            const status = getStatus(item);

            return (
              <div
                key={courseId}
                className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 group-hover:bg-sky-600 transition-colors">
                  <StatusIcon status={status} />
                </span>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {course?.title || "Untitled course"}
                  </h3>
                  <span
                    className="text-xs font-medium text-slate-400 uppercase"
                    style={mono}
                  >
                    {status}
                  </span>
                </div>

                {status === "ACTIVE" || status === "COMPLETED" ? (
                  <Link
                    to={`/student/recordings/${courseId}`}
                    className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:gap-2 transition-all"
                  >
                    {status === "COMPLETED" ? "Review" : "Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="shrink-0 text-xs text-slate-400">Awaiting access</span>
                )}
              </div>
            );
          })}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No courses in this category yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMyCourses;