import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Terminal,
  Plus,
  Trash2,
  Pencil,
  PlaySquare,
  Video,
  X,
  Eye,
  EyeOff,
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

function RowSkeleton() {
  return (
    <tr className="border-t border-slate-100">
      <td colSpan={6} className="px-5 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse" />
      </td>
    </tr>
  );
}
function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    instructorId: "",
  });

  const [instructors, setInstructors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get("/admin/instructors");
        setInstructors(res.data);
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    };

    fetchInstructors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await api.post("/courses", {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail || undefined,
        price: Number(form.price) || 0,
        instructorId: Number(form.instructorId),
      });

      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-900" style={display}>
          Create Course
        </h3>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            placeholder="Course title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            rows={3}
          />

          <input
            placeholder="Thumbnail URL (optional)"
            value={form.thumbnail}
            onChange={(e) =>
              setForm({
                ...form,
                thumbnail: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <input
            type="number"
            min="0"
            placeholder="Price (0 for free)"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <select
            required
            value={form.instructorId}
            onChange={(e) =>
              setForm({
                ...form,
                instructorId: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">Select Instructor</option>

            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition"
          >
            {saving ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditCourseModal({ course, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    instructorId: "",
  });

  const [instructors, setInstructors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        price: course.price || 0,
        instructorId: course.instructorId ?? course.instructor?.id ?? "",
      });
    }
  }, [course]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get("/admin/instructors");
        setInstructors(res.data);
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    };

    fetchInstructors();
  }, []);

  if (!course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await api.put(`/courses/${course.id}`, {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail || undefined,
        price: Number(form.price) || 0,
        instructorId: Number(form.instructorId),
      });

      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-900" style={display}>
          Edit Course
        </h3>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            placeholder="Course title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            rows={3}
          />

          <input
            placeholder="Thumbnail URL (optional)"
            value={form.thumbnail}
            onChange={(e) =>
              setForm({
                ...form,
                thumbnail: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <input
            type="number"
            min="0"
            placeholder="Price (0 for free)"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          <select
            required
            value={form.instructorId}
            onChange={(e) =>
              setForm({
                ...form,
                instructorId: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">Select Instructor</option>

            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | published | draft
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

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

  const handleDelete = async (courseId, title) => {
    if (
      !confirm(
        `Delete "${title}"? This also deletes its modules, recordings, live classes, and enrollments. This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete course.");
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const res = await api.put(`/courses/${course.id}`, {
        isPublished: !course.isPublished,
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: res.data.isPublished } : c,
        ),
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update publish status.");
    }
  };

  const handleCourseSaved = (updated) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  };

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

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            <Terminal className="w-3.5 h-3.5" /> courses
          </span>
          <h1
            className="mt-3 text-3xl font-semibold text-slate-900"
            style={display}
          >
            Courses
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            All courses across every instructor, published and draft.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </button>
      </div>

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
              <tr
                className="text-left text-slate-400 text-xs uppercase tracking-wider"
                style={mono}
              >
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}

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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          course.isPublished
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTogglePublish(course)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            course.isPublished
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-sky-600 text-white hover:bg-sky-700"
                          }`}
                        >
                          {course.isPublished ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          {course.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit Course"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/admin/courses/${course.id}/recordings`}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Manage Modules & Recordings"
                        >
                          <PlaySquare className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/courses/${course.id}/live-classes`}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Manage Live Classes"
                        >
                          <Video className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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

      {createOpen && (
        <CreateCourseModal
          onClose={() => setCreateOpen(false)}
          onCreated={(newCourse) => setCourses((prev) => [newCourse, ...prev])}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={handleCourseSaved}
        />
      )}
    </div>
  );
}