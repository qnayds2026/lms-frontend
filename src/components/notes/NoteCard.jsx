import {
  FileText,
  PlayCircle,
  Globe,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";

export default function NoteCard({ note, editable = false, onEdit, onDelete }) {
  return (
    <div className="group border-b border-slate-200 py-5 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {note.title}
            </h3>

            {note.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {note.description}
              </p>
            )}

            {/* Resources */}

            {(note.referenceVideo || note.referenceLink) && (
              <div className="mt-4 flex flex-wrap gap-5">
                {note.referenceVideo && (
                  <a
                    href={note.referenceVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Reference Video
                  </a>
                )}

                {note.referenceLink && (
                  <a
                    href={note.referenceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Documentation
                  </a>
                )}
              </div>
            )}

            {/* Footer */}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>
                By{" "}
                <span className="font-medium text-slate-500">
                  {note.creator?.name || "Unknown"}
                </span>
              </span>

              {note.createdAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />

                  {new Date(note.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}

        {editable && (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => onEdit(note)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-sky-600"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(note)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
