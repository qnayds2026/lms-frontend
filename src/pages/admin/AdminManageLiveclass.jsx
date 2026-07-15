import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Video,
  Terminal,
  ExternalLink,
  X,
  Trash2,
  Pencil,
} from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Converts an ISO date string to the format <input type="datetime-local"> expects
function toDateTimeLocalValue(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Handles BOTH creating a new class and editing an existing one.
// Pass `editingClass` to switch into edit mode.
function ClassFormModal({ courseId, editingClass, onClose, onSaved }) {
  const isEditing = Boolean(editingClass);

  const [form, setForm] = useState({
    title: editingClass?.title || "",
    description: editingClass?.description || "",
    scheduledAt: toDateTimeLocalValue(editingClass?.scheduledAt),
    durationMinutes: editingClass?.durationMinutes || 60,
    platform: editingClass?.platform || "MANUAL",
    meetLink: editingClass?.meetLink || "",
    status: editingClass?.status || "SCHEDULED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEditing) {
        // PUT only accepts title, description, scheduledAt, status, meetLink
        // (not courseId, platform, or durationMinutes — those aren't editable per the backend)
        const res = await api.put(`/liveclasses/${editingClass.id}`, {
          title: form.title,
          description: form.description,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          status: form.status,
          meetLink: form.meetLink,
        });
        onSaved(res.data);
      } else {
        const res = await api.post("/liveclasses", {
          ...form,
          courseId,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMinutes: Number(form.durationMinutes),
        });
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save live class.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900" style={display}>
          {isEditing ? "Edit Live Class" : "Schedule Live Class"}
        </h3>
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            placeholder="Class title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            rows={2}
          />
          <input
            required
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />

          {!isEditing && (
            <>
              <input
                type="number"
                min="1"
                placeholder="Duration (minutes)"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="MANUAL">Manual link (Zoom/Meet you already have)</option>
                <option value="ZOOM">Auto-create Zoom meeting</option>
                <option value="GOOGLE_MEET">Auto-create Google Meet</option>
              </select>
            </>
          )}

          {(isEditing || form.platform === "MANUAL") && (
            <input
              required={form.platform === "MANUAL"}
              placeholder="Meeting link (Zoom, Meet, etc.)"
              value={form.meetLink}
              onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          )}

          {isEditing && (
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">Live now</option>
              <option value="ENDED">Ended</option>
            </select>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Schedule Class"}
          </button>
        </form>
      </div>
    </div>
  );
}

const AdminManageLiveClasses = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    // Fetch independently — a 403 on live classes shouldn't also hide the course title.
    const courseResult = await api
      .get(`/courses/${courseId}`)
      .then((res) => ({ ok: true, data: res.data }))
      .catch((err) => ({ ok: false, err }));

    const classesResult = await api
      .get(`/liveclasses/course/${courseId}`)
      .then((res) => ({ ok: true, data: res.data }))
      .catch((err) => ({ ok: false, err }));

    if (courseResult.ok) setCourse(courseResult.data);

    if (classesResult.ok) {
      setClasses(classesResult.data || []);
    } else {
      setError(
        classesResult.err?.response?.data?.error ||
          classesResult.err?.response?.data?.message ||
          "Failed to load live classes."
      );
    }

    if (!courseResult.ok && !classesResult.ok) {
      setError(
        courseResult.err?.response?.data?.message || "Failed to load this course."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this live class?")) return;
    try {
      await api.delete(`/liveclasses/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete.");
    }
  };

  const statusBadge = (status) => {
    const styles = {
      SCHEDULED: "bg-sky-50 text-sky-600",
      LIVE: "bg-red-50 text-red-500",
      ENDED: "bg-slate-100 text-slate-400",
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${styles[status] || styles.SCHEDULED}`}
        style={mono}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <Link
        to="/admin/courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            <Terminal className="w-3.5 h-3.5" /> manage_live_classes
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900" style={display}>
            {course?.title}
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingClass(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Schedule Class
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
              <Video className="h-5 w-5 text-sky-600" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 truncate">{cls.title}</p>
                {statusBadge(cls.status)}
              </div>
              <p className="text-xs text-slate-400 mt-1" style={mono}>
                {formatDateTime(cls.scheduledAt)}
              </p>
            </div>
            <a
              href={cls.meetLink}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline"
            >
              Link <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => {
                setEditingClass(cls);
                setModalOpen(true);
              }}
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(cls.id)}
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No live classes scheduled yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <ClassFormModal
          courseId={courseId}
          editingClass={editingClass}
          onClose={() => {
            setModalOpen(false);
            setEditingClass(null);
          }}
          onSaved={(savedClass) => {
            setClasses((prev) => {
              const exists = prev.some((c) => c.id === savedClass.id);
              return exists
                ? prev.map((c) => (c.id === savedClass.id ? savedClass : c))
                : [...prev, savedClass];
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminManageLiveClasses;