import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Terminal,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminInstructorDetail() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyCourseId, setBusyCourseId] = useState(null);

  const fetchInstructor = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/instructors/${id}`);
      setInstructor(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load instructor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const togglePublish = async (course) => {
    setBusyCourseId(course.id);
    try {
      // Admin-only field per your updateCourse controller.
      await api.put(`/courses/${course.id}`, {
        isPublished: !course.isPublished,
      });
      setInstructor((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
        ),
      }));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update course.");
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleDelete = async (course) => {
    if (
      !window.confirm(
        `Delete "${course.title}"? This removes the course entirely and can't be undone.`
      )
    ) {
      return;
    }
    setBusyCourseId(course.id);
    try {
      await api.delete(`/courses/${course.id}`);
      setInstructor((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== course.id),
      }));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete course.");
    } finally {
      setBusyCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="mt-6 h-32 bg-white border border-slate-200 rounded-2xl" />
        <div className="mt-6 h-64 bg-white border border-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
        <style>{FONT_IMPORT}</style>
        <Link
          to="/admin/instructors"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Instructors
        </Link>
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error || "Instructor not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <Link
        to="/admin/instructors"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Instructors
      </Link>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> instructor_profile
      </span>

      {/* Profile card */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl font-semibold shrink-0" style={display}>
          {instructor.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-slate-900" style={display}>
            {instructor.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {instructor.email}
            </span>
            {instructor.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {instructor.phone}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(instructor.joinedAt)}
            </span>
          </div>
        </div>
        <span
          className={`self-start px-2.5 py-1 rounded-full text-xs font-medium border ${
            instructor.isActive
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          {instructor.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-semibold text-slate-900" style={display}>
            {instructor.courses.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total Courses</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-semibold text-slate-900" style={display}>
            {instructor.courses.filter((c) => c.isPublished).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Published</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-semibold text-slate-900" style={display}>
            {instructor.totalStudents}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total Students</p>
        </div>
      </div>

      {/* Courses table */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Courses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wider" style={mono}>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructor.courses.map((course) => (
                <tr key={course.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <BookOpen size={14} />
                      </span>
                      <span className="font-medium text-slate-900">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700" style={mono}>
                    {formatINR(course.price)}
                  </td>
                  <td className="px-5 py-3 text-slate-700" style={mono}>
                    {course._count?.enrollments ?? 0}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs" style={mono}>
                    {formatDate(course.createdAt)}
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
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => togglePublish(course)}
                        disabled={busyCourseId === course.id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors disabled:opacity-50"
                        title={course.isPublished ? "Unpublish" : "Publish"}
                      >
                        {course.isPublished ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={busyCourseId === course.id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {instructor.courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    This instructor hasn't created any courses yet.
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