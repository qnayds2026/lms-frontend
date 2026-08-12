import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  referenceVideo: "",
  referenceLink: "",
};

export default function AddNoteModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        referenceVideo: initialData.referenceVideo || "",
        referenceLink: initialData.referenceLink || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return alert("Title is required.");
    }

    if (!form.description.trim()) {
      return alert("Description is required.");
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? "Edit Note" : "Add Module Note"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Linux Basics"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              rows={6}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write module notes..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reference Video (Optional)
            </label>

            <input
              name="referenceVideo"
              value={form.referenceVideo}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reference Website (Optional)
            </label>

            <input
              name="referenceLink"
              value={form.referenceLink}
              onChange={handleChange}
              placeholder="https://owasp.org"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-600 px-5 py-2 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? initialData
                  ? "Updating..."
                  : "Saving..."
                : initialData
                  ? "Update Note"
                  : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
