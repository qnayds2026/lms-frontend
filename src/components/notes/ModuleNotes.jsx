import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "../../api/axios";

import NoteCard from "./NoteCard";
import AddNoteModal from "./AddNoteModal";

const ModuleNotes = forwardRef(function ModuleNotes(
  { moduleId, editable = true, onCountChange },
  ref,
) {
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);

  // ==========================
  // GET NOTES
  // ==========================

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/notes/module/${moduleId}`);

      const list = res.data.data || [];

      setNotes(list);

      // Let the parent know how many notes this module has, so it can
      // show a count badge without needing to render this whole panel.
      onCountChange?.(list.length);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  // ==========================
  // CREATE / UPDATE
  // ==========================

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);

      if (selectedNote) {
        await axios.put(`/notes/${selectedNote.id}`, formData);

        alert("Note updated successfully.");
      } else {
        await axios.post(`/notes/module/${moduleId}`, formData);

        alert("Note created successfully.");
      }

      setOpenModal(false);

      setSelectedNote(null);

      fetchNotes();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // DELETE
  // ==========================

  const handleDelete = async (note) => {
    const confirmDelete = window.confirm(`Delete "${note.title}" ?`);

    if (!confirmDelete) return;

    try {
      await axios.delete(`/notes/${note.id}`);

      alert("Note deleted successfully.");

      fetchNotes();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to delete note.");
    }
  };

  // ==========================
  // EDIT
  // ==========================

  const handleEdit = (note) => {
    setSelectedNote(note);

    setOpenModal(true);
  };

  // ==========================
  // ADD
  // ==========================

  const handleAdd = () => {
    setSelectedNote(null);

    setOpenModal(true);
  };

  // Expose an imperative "open the add form" action so a parent header
  // button can trigger it directly, without the panel needing to be
  // expanded first.
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd,
  }));

  return (
    <>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              📚 Learning Resources
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Helpful notes, videos and documentation for this module.
            </p>
          </div>

          {editable && (
            <button
              onClick={handleAdd}
              className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              + Add Resource
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="divide-y divide-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse px-6 py-6">
                <div className="h-5 w-48 rounded bg-slate-200" />

                <div className="mt-4 h-4 w-full rounded bg-slate-100" />

                <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-3xl">
              📚
            </div>

            <h4 className="mt-5 text-xl font-semibold text-slate-900">
              No Learning Resources
            </h4>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Share notes, cheat sheets, reference videos and documentation to
              help students understand this module better.
            </p>

            {editable && (
              <button
                onClick={handleAdd}
                className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-medium text-white transition hover:bg-sky-700"
              >
                + Add First Resource
              </button>
            )}
          </div>
        ) : (
          /* Notes */
          <div className="divide-y divide-slate-200 px-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                editable={editable}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddNoteModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedNote(null);
          // Refresh even on a plain cancel/close, so the list and count
          // badge always reflect the current server state.
          fetchNotes();
        }}
        onSubmit={handleSubmit}
        loading={saving}
        initialData={selectedNote}
      />
    </>
  );
});

export default ModuleNotes;
