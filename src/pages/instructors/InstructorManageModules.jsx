import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Plus,
  X,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  GripVertical,
} from "lucide-react";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const EMPTY_FORM = {
  title: "",
  description: "",
  order: "",
};

function ModulesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl h-20"
        />
      ))}
    </div>
  );
}

// Create / Edit modal — isOpen driven, no route change
function ModuleFormModal({ isOpen, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              description: initialData.description || "",
              order: initialData.order ?? "",
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
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 my-8"
          style={{ animation: "modalPopIn 200ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-slate-100">
            <h2
              className="text-lg sm:text-xl font-semibold text-slate-900"
              style={display}
            >
              {initialData ? "Edit Module" : "Add Module"}
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
                placeholder="e.g. Introduction to Networking"
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
                placeholder="What does this module cover?"
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition resize-none"
              />
            </div>

            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                order
              </label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                placeholder="1"
                min="1"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
              />
              <p className="mt-1 text-xs text-slate-400">
                Position of this module in the course sequence.
              </p>
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
                {initialData ? "Save changes" : "Add module"}
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
  moduleTitle,
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
            Delete this module?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {moduleTitle
              ? `"${moduleTitle}" and its content will be permanently removed.`
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

const InstructorManageModules = () => {
  const { courseId } = useParams();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // GET /modules/course/:courseId
  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/modules/course/${courseId}`);
      const list = res.data?.data || res.data || [];
      setModules([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchModules();
  }, [courseId]);

  const openCreateModal = () => {
    setEditingModule(null);
    setIsFormOpen(true);
  };

  const openEditModal = (mod) => {
    setEditingModule(mod);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingModule(null);
  };

  // POST /modules, PUT /modules/:id
  const handleFormSubmit = async (form) => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        order: form.order ? Number(form.order) : undefined,
        courseId,
      };

      if (editingModule) {
        const res = await api.put(`/modules/${editingModule.id}`, payload);
        const updated = res.data?.data || res.data;
        setModules((prev) =>
          [...prev]
            .map((m) => (m.id === editingModule.id ? { ...m, ...updated } : m))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        );
      } else {
        const res = await api.post("/modules", payload);
        const created = res.data?.data || res.data;
        setModules((prev) =>
          [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        );
      }

      setIsFormOpen(false);
      setEditingModule(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // DELETE /modules/:id
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/modules/${deleteTarget.id}`);
      setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete module");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to courses
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-slate-900"
            style={display}
          >
            Manage Modules
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Structure the content of this course into modules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-medium transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <ModulesSkeleton />
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 sm:p-14 text-center">
          <Layers className="w-9 h-9 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-900">
            No modules yet
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            Break this course down into modules for your students.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, index) => (
            <div
              key={mod.id}
              className="group bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-sky-200 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200 flex items-start sm:items-center gap-4"
            >
              <GripVertical className="hidden sm:block w-4 h-4 text-slate-300 shrink-0 mt-1 sm:mt-0" />

              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 text-sm font-semibold"
                style={display}
              >
                {mod.order ?? index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug wrap-break-words">
                  {mod.title}
                </h3>
                {mod.description && (
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 wrap-break-words">
                    {mod.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/instructor/modules/${mod.id}/attachments`}
                  className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                >
                  📎 Attachments
                </Link>

                <button
                  onClick={() => openEditModal(mod)}
                  title="Edit module"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteTarget(mod)}
                  title="Delete module"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModuleFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingModule}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        moduleTitle={deleteTarget?.title}
        deleting={deleting}
      />
    </div>
  );
};

export default InstructorManageModules;
