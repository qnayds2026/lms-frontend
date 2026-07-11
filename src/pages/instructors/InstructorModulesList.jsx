import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Terminal } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-40 animate-pulse" />
  );
}

const InstructorModulesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/courses/mine");
        setCourses(res.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load your courses.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" />
        modules
      </span>

      <h1
        className="mt-3 text-3xl font-semibold text-slate-900"
        style={display}
      >
        Course Modules
      </h1>

      <p className="text-slate-500 mt-1.5 text-sm">
        Select a course to manage its modules.
      </p>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Courses */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {loading && [0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}

        {!loading &&
          courses.map((course) => (
            <Link
              key={course.id}
              to={`/instructor/courses/${course.id}/modules`}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition flex flex-col"
            >
              <span className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </span>

              <h3 className="mt-4 font-semibold text-slate-900 leading-snug">
                {course.title}
              </h3>

              <div
                className="mt-1.5 flex items-center gap-3 text-xs text-slate-400"
                style={mono}
              >
                <span>{course._count?.enrollments ?? 0} students</span>

                <span>{course.isPublished ? "Published" : "Draft"}</span>
              </div>

              <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-600 group-hover:gap-2 transition-all">
                Manage Modules
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          You haven't created any courses yet.
        </div>
      )}
    </div>
  );
};

export default InstructorModulesList;
