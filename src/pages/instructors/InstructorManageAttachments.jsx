import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Paperclip,
  FileText,
  Archive,
  Image as ImageIcon,
  FileVideo,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import api from "../../api/axios";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const FILE_ICONS = {
  pdf: { icon: FileText, color: "bg-red-50 text-red-600" },
  docx: { icon: FileText, color: "bg-sky-50 text-sky-600" },
  doc: { icon: FileText, color: "bg-sky-50 text-sky-600" },
  zip: { icon: Archive, color: "bg-amber-50 text-amber-600" },
  rar: { icon: Archive, color: "bg-amber-50 text-amber-600" },
  png: { icon: ImageIcon, color: "bg-emerald-50 text-emerald-600" },
  jpg: { icon: ImageIcon, color: "bg-emerald-50 text-emerald-600" },
  jpeg: { icon: ImageIcon, color: "bg-emerald-50 text-emerald-600" },
  mp4: { icon: FileVideo, color: "bg-violet-50 text-violet-600" },
};

function fileMeta(type) {
  return (
    FILE_ICONS[type?.toLowerCase()] || {
      icon: Paperclip,
      color: "bg-slate-100 text-slate-500",
    }
  );
}

function ListSkeleton() {
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

function DeleteConfirmModal({ attachment, onClose, onConfirm, deleting }) {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 text-lg">
            Delete this attachment?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {`"${attachment.title}" will be permanently removed.`}
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

const InstructorManageAttachments = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [adding, setAdding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/module-attachments/module/${moduleId}`);
      setAttachments(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [moduleId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) return;

    try {
      setAdding(true);
      const res = await api.post("/module-attachments", {
        moduleId: Number(moduleId),
        title,
        fileUrl,
        fileType,
      });

      const created = res.data?.data || res.data;
      setAttachments((prev) => [created, ...prev]);

      setTitle("");
      setFileUrl("");
      setFileType("");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add attachment");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/module-attachments/${deleteTarget.id}`);
      setAttachments((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete attachment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-600 transition mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to module
      </button>

      <h1
        className="text-2xl sm:text-3xl font-semibold text-slate-900"
        style={display}
      >
        Manage Attachments
      </h1>
      <p className="mt-1 text-slate-500 text-sm sm:text-base">
        Add downloadable resources for students in this module.
      </p>
      <span
        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        module_id: {moduleId}
      </span>

      {/* Add Attachment */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mt-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
            <Plus className="w-4 h-4 text-sky-600" />
          </span>
          <h2 className="font-semibold text-slate-900">Add Attachment</h2>
        </div>

        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500" style={mono}>
              title
            </label>
            <input
              type="text"
              placeholder="e.g. Week 1 slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500" style={mono}>
              file url
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500" style={mono}>
              file type
            </label>
            <input
              type="text"
              placeholder="pdf, zip, docx..."
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Attachment
            </button>
          </div>
        </form>
      </div>

      {/* Attachment List */}
      {loading ? (
        <ListSkeleton />
      ) : attachments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 sm:p-14 text-center">
          <Paperclip className="w-9 h-9 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No attachments yet
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            Add your first resource using the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => {
            const { icon: Icon, color } = fileMeta(attachment.fileType);
            return (
              <div
                key={attachment.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-sky-200 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200 flex items-center gap-4"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="w-5 h-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                    {attachment.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                    {attachment.fileType && (
                      <span
                        className="text-[11px] uppercase tracking-wide text-slate-400"
                        style={mono}
                      >
                        {attachment.fileType}
                      </span>
                    )}
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs sm:text-sm font-medium transition"
                    >
                      Open file
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget(attachment)}
                  title="Delete attachment"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmModal
        attachment={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </div>
  );
};

export default InstructorManageAttachments;
