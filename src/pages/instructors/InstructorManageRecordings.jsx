import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Eye,
  EyeOff,
  Terminal,
  PlaySquare,
  X,
} from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// NOTE: assumes GET /modules/course/:courseId exists, following the same
// "list by parent" pattern as your other routes. Confirm against your
// actual module.routes.js and adjust if the path differs.

function AddRecordingModal({ moduleId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", youtubeUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await api.post("/recordings", { ...form, moduleId });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to add recording.");
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
          Add Recording
        </h3>
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            placeholder="Lesson title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            rows={3}
          />
          <input
            required
            placeholder="YouTube URL"
            value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition"
          >
            {saving ? "Saving..." : "Add Recording"}
          </button>
        </form>
      </div>
    </div>
  );
}

const InstructorManageRecordings = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalModuleId, setModalModuleId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const courseRes = await api.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      const moduleList = courseRes.data?.modules || [];

      const recordingsByModule = await Promise.all(
        moduleList.map((m) =>
          api
            .get(`/recordings/module/${m.id}`)
            .then((res) => res.data)
            .catch(() => [])
        )
      );

      setModules(
        moduleList.map((m, i) => ({
          id: m.id,
          title: m.title,
          recordings: recordingsByModule[i] || [],
        }))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const togglePublish = async (recording, moduleId) => {
    try {
      const endpoint = recording.isPublished
        ? `/recordings/${recording.id}/unpublish`
        : `/recordings/${recording.id}/publish`;
      await api.patch(endpoint);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                recordings: m.recordings.map((r) =>
                  r.id === recording.id ? { ...r, isPublished: !r.isPublished } : r
                ),
              }
            : m
        )
      );
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update publish status.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 bg-slate-50 min-h-screen animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-24" />
          ))}
        </div>
      </div>
    );
  }

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

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> manage_recordings
      </span>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900" style={display}>
        {course?.title}
      </h1>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">{module.title}</h2>
              <button
                onClick={() => setModalModuleId(module.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Recording
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {module.recordings.map((rec) => (
                <li key={rec.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                    <PlaySquare className="h-4 w-4 text-sky-600" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{rec.title}</p>
                    {rec.duration && (
                      <p className="text-xs text-slate-400">{rec.duration}</p>
                    )}
                  </div>
                  <button
                    onClick={() => togglePublish(rec, module.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      rec.isPublished
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {rec.isPublished ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    {rec.isPublished ? "Published" : "Draft"}
                  </button>
                </li>
              ))}
              {module.recordings.length === 0 && (
                <li className="px-5 py-6 text-center text-sm text-slate-400">
                  No recordings yet.
                </li>
              )}
            </ul>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            This course has no modules yet.
          </div>
        )}
      </div>

      {modalModuleId && (
        <AddRecordingModal
          moduleId={modalModuleId}
          onClose={() => setModalModuleId(null)}
          onCreated={(newRec) =>
            setModules((prev) =>
              prev.map((m) =>
                m.id === modalModuleId
                  ? { ...m, recordings: [...m.recordings, newRec] }
                  : m
              )
            )
          }
        />
      )}
    </div>
  );
};

export default InstructorManageRecordings;