import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Plus,
  X,
  Layers,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  Clock,
  Tag,
} from "lucide-react";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  category: "",
  thumbnail: "",
  duration: "",
};

function CoursesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl h-72"
        />
      ))}
    </div>
  );
}

// Create / Edit modal — isOpen driven, no route change
function CourseFormModal({ isOpen, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              description: initialData.description || "",
              price: initialData.price ?? "",
              category: initialData.category || "",
              thumbnail: initialData.thumbnail || "",
              duration: initialData.duration || "",
            }
          : EMPTY_FORM,
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-100">
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        className="absolute inset-0 bg-black/40"
        style={{ animation: "modalFadeIn 180ms ease-out" }}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 my-8"
          style={{ animation: "modalPopIn 200ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-slate-100">
            <h2
              className="text-lg sm:text-xl font-semibold text-slate-900"
              style={display}
            >
              {initialData ? "Edit Course" : "Create Course"}
            </h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-6 space-y-4">
            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Ethical Hacking Fundamentals"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                required
              />
            </div>

            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What will students learn?"
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-medium text-slate-500"
                  style={mono}
                >
                  price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0 for free"
                  min="0"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium text-slate-500"
                  style={mono}
                >
                  duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 weeks"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Cybersecurity"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
              />
            </div>

            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                thumbnail url
              </label>
              <input
                type="text"
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {initialData ? "Save changes" : "Create course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal — isOpen driven
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
  deleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 text-lg">
            Delete this course?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {courseTitle
              ? `"${courseTitle}" will be permanently removed.`
              : "This action cannot be undone."}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Course details modal — fetches GET /courses/:id when opened, no route change
function CourseDetailsModal({ isOpen, onClose, courseId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !courseId) return;

    let cancelled = false;
    setLoading(true);
    setDetails(null);

    (async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (!cancelled) setDetails(res.data?.data || res.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100">
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        className="absolute inset-0 bg-black/40"
        style={{ animation: "modalFadeIn 180ms ease-out" }}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden"
          style={{ animation: "modalPopIn 200ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-400 hover:text-slate-600 hover:bg-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 min-h-75">
              <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
              <p className="text-sm text-slate-400">Loading course...</p>
            </div>
          ) : !details ? (
            <div className="p-10 text-center min-h-75 flex flex-col items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                Couldn't load this course.
              </p>
            </div>
          ) : (
            <>
              <div className="h-44 sm:h-52 bg-slate-100 flex items-center justify-center">
                {details.thumbnail ? (
                  <img
                    src={details.thumbnail}
                    alt={details.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Layers className="w-9 h-9 text-slate-300" />
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {details.isPublished ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      Draft
                    </span>
                  )}
                  {details.category && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 px-3 py-1 rounded-full font-medium"
                      style={mono}
                    >
                      <Tag className="w-3 h-3" />
                      {details.category}
                    </span>
                  )}
                </div>

                <h2
                  className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900"
                  style={display}
                >
                  {details.title}
                </h2>

                {details.description && (
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                    {details.description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-5 flex-wrap">
                  <span className="text-lg font-bold text-slate-900">
                    {details.price ? `₹${details.price}` : "Free"}
                  </span>
                  {details.duration && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {details.duration}
                    </span>
                  )}
                  {typeof details.enrolledCount === "number" && (
                    <span className="text-sm text-slate-400">
                      {details.enrolledCount} students enrolled
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewingCourseId, setViewingCourseId] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/mine");
      setCourses(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  // Assumed routes: POST /courses (create), PUT /courses/:id (update)
  const handleFormSubmit = async (form) => {
    try {
      setSaving(true);
      const payload = { ...form, price: Number(form.price) || 0 };

      if (editingCourse) {
        const res = await api.put(`/courses/${editingCourse.id}`, payload);
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id ? { ...c, ...res.data } : c,
          ),
        );
      } else {
        const res = await api.post("/courses", payload);
        setCourses((prev) => [res.data, ...prev]);
      }

      setIsFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Assumed route: DELETE /courses/:id
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/courses/${deleteTarget.id}`);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  // Note: publishing is an admin-only action, not exposed on the instructor page

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-slate-900"
            style={display}
          >
            My Courses
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage and publish your courses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-medium transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <CoursesSkeleton />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 sm:p-14 text-center">
          <Layers className="w-9 h-9 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-900">
            No courses yet
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            Create your first course.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-sky-200 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-40 bg-slate-50 border-b border-slate-100 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-7 h-7 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                {(course.category || course.duration) && (
                  <div
                    className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-wide"
                    style={mono}
                  >
                    {course.category && <span>{course.category}</span>}
                    {course.category && course.duration && <span>·</span>}
                    {course.duration && (
                      <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    )}
                  </div>
                )}

                <h3 className="mt-1.5 font-semibold text-slate-900 leading-snug line-clamp-2">
                  {course.title}
                </h3>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-slate-900">
                    {course.price ? `₹${course.price}` : "Free"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      course.isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        course.isPublished ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {typeof course.enrolledCount === "number" && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    {course.enrolledCount} students enrolled
                  </p>
                )}

                {/* Action bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingCourseId(course.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(course)}
                      title="Edit course"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(course)}
                      title="Delete course"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CourseFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingCourse}
        saving={saving}
      />

      <CourseDetailsModal
        isOpen={!!viewingCourseId}
        onClose={() => setViewingCourseId(null)}
        courseId={viewingCourseId}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        courseTitle={deleteTarget?.title}
        deleting={deleting}
      />
    </div>
  );
};

export default MyCourses;
