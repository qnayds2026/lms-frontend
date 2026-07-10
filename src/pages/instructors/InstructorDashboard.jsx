import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Terminal, Video, ArrowRight } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCardSkeleton() {
  return <div className="bg-white rounded-2xl border border-slate-200 h-32 animate-pulse" />;
}

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      try {
        const res = await api.get("/courses/mine");
        setCourses(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load your courses.");
      } finally {
        setLoadingCourses(false);
      }
    }

    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const res = await api.get("/enrollments/my-students");
        setStudents(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchCourses();
    fetchStudents();
  }, []);

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> instructor_session
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
        {getGreeting()} 👋
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        Here's what's happening across your courses.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {loadingCourses ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Link
              to="/instructor/my-courses"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">My Courses</h3>
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
                {courses.length}
              </p>
            </Link>

            <Link
              to="/instructor/my-students"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">Total Students</h3>
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
                {loadingStudents ? "…" : students.length || totalEnrollments}
              </p>
            </Link>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition cursor-default">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">Published Courses</h3>
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
                {courses.filter((c) => c.isPublished).length}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <Link
          to="/instructor/my-courses"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              your_courses
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900" style={display}>
              Manage Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Create, edit, and publish your courses.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </Link>

        <Link
          to="/instructor/my-students"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              my_students
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900" style={display}>
              View Students
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              See who's enrolled, filter by course.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default InstructorDashboard;