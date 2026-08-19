import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Lock,
  Terminal,
  Circle,
  Paperclip,
  Download,
  Layers,
  Star,
  MessageSquare,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// --- NEW: star rating input (click to set, hover to preview) ---
function StarRatingInput({ value, onChange, size = "h-6 w-6" }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            className={`${size} transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// --- NEW: reviews & ratings section for the course ---
function ReviewsSection({ courseId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/course/${courseId}`);
      setData(res.data);
      if (res.data.myReview) {
        setMyRating(res.data.myReview.rating);
        setMyComment(res.data.myReview.comment || "");
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (myRating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.post("/reviews", {
        courseId,
        rating: myRating,
        comment: myComment,
      });
      await fetchReviews();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save your review.");
    } finally {
      setSaving(false);
    }
  };

  const otherReviews = (data?.reviews || []).filter(
    (r) => r.id !== data?.myReview?.id,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-sky-600" />
        <h2 className="text-sm font-semibold text-slate-900">
          Reviews &amp; Ratings
        </h2>
      </div>

      {loading ? (
        <div className="mt-4 h-16 bg-slate-50 rounded-lg animate-pulse" />
      ) : (
        <>
          {/* Average rating summary */}
          <div className="mt-4 flex items-center gap-3">
            <span
              className="text-3xl font-semibold text-slate-900"
              style={display}
            >
              {data?.totalReviews > 0 ? data.averageRating.toFixed(1) : "—"}
            </span>
            <div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(data?.averageRating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {data?.totalReviews || 0} review
                {data?.totalReviews === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Your review form */}
          <form
            onSubmit={handleSubmit}
            className="mt-5 pt-5 border-t border-slate-100"
          >
            <p
              className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
              style={mono}
            >
              {data?.myReview ? "Edit your review" : "Rate this course"}
            </p>
            <div className="mt-2.5">
              <StarRatingInput value={myRating} onChange={setMyRating} />
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share your thoughts about this course (optional)"
              rows={3}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
            >
              {saving
                ? "Saving..."
                : data?.myReview
                  ? "Update Review"
                  : "Submit Review"}
            </button>
          </form>

          {/* Other students' reviews */}
          {otherReviews.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
              {otherReviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-semibold">
                    {review.student?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">
                        {review.student?.name || "Student"}
                      </p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-slate-600">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- NEW: a single read-only note, expandable to show description + links ---
function StudentNoteItem({ note }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-sky-50 rounded-lg transition-colors"
      >
        <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">
          {note.title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-2 pb-3 pl-9 space-y-2">
          {note.description && (
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
              {note.description}
            </p>
          )}
          {(note.referenceVideo || note.referenceLink) && (
            <div className="flex flex-wrap gap-3">
              {note.referenceVideo && (
                <a
                  href={note.referenceVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  <Video className="w-3 h-3" />
                  Reference video
                </a>
              )}
              {note.referenceLink && (
                <a
                  href={note.referenceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  <LinkIcon className="w-3 h-3" />
                  Reference link
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const StudentRecordings = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeRecordingId, setActiveRecordingId] = useState(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourseAndRecordings() {
      setLoading(true);
      setError("");

      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        const courseData = courseRes.data;
        setCourse(courseData);

        const moduleList = courseData?.modules || [];

        const moduleData = await Promise.all(
          moduleList.map(async (m) => {
            const recordings = await api
              .get(`/recordings/module/${m.id}`)
              .then((res) => res.data)
              .catch(() => []);

            const attachments = await api
              .get(`/module-attachments/module/${m.id}`)
              .then((res) => res.data?.data || res.data || [])
              .catch(() => []);

            // NEW: read-only notes for this module
            const notes = await api
              .get(`/notes/module/${m.id}`)
              .then((res) => res.data?.data || res.data || [])
              .catch(() => []);

            return {
              id: m.id,
              title: m.title,
              recordings,
              attachments,
              notes,
            };
          }),
        );

        setModules(moduleData);

        const firstModuleWithRecording = moduleData.find(
          (m) => m.recordings.length > 0,
        );
        const firstRecording = firstModuleWithRecording?.recordings[0];

        if (firstRecording) {
          setActiveRecordingId(firstRecording.id);
        }
        if (firstModuleWithRecording) {
          setExpandedModuleIds(new Set([firstModuleWithRecording.id]));
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load this course. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCourseAndRecordings();
  }, [courseId]);

  const allRecordings = modules.flatMap((m) =>
    m.recordings.map((r) => ({ ...r, moduleTitle: m.title })),
  );

  const activeRecording = allRecordings.find((r) => r.id === activeRecordingId);
  const activeIndex = allRecordings.findIndex(
    (r) => r.id === activeRecordingId,
  );

  const toggleModule = (moduleId) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 mt-8">
          <div className="aspect-video bg-slate-200 rounded-2xl" />
          <div className="bg-white border border-slate-200 rounded-2xl h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <style>{FONT_IMPORT}</style>

      <Link
        to="/student/my-courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to My Courses
      </Link>

      <div
        className={`grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 [grid-template-areas:'video'_'content'_'reviews'] lg:[grid-template-areas:'video_content'_'reviews_content']`}
      >
        {/* Video area — YouTube / Drive embed */}
        <div className="[grid-area:video]">
          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
            <div
              className={
                activeRecording?.provider === "GOOGLE_DRIVE"
                  ? "w-full"
                  : "aspect-video w-full"
              }
              style={
                activeRecording?.provider === "GOOGLE_DRIVE"
                  ? { paddingBottom: "68%" }
                  : undefined
              }
            >
              {activeRecording?.embedUrl ? (
                <iframe
                  key={activeRecording.id}
                  className="absolute inset-0 h-full w-full"
                  src={activeRecording.embedUrl}
                  title={activeRecording.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  webkitallowfullscreen="true"
                  mozallowfullscreen="true"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/40 text-sm px-6 text-center">
                  No video available for this lesson yet.
                </div>
              )}
              {activeRecording?.provider === "GOOGLE_DRIVE" &&
                activeRecording?.embedUrl && (
                  <div
                    className="absolute top-0 right-0 h-14 w-16 z-10"
                    title="Opening in Drive is disabled"
                  />
                )}
            </div>
          </div>

          <div className="mt-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
              style={mono}
            >
              <Terminal className="w-3.5 h-3.5" /> {course?.title}
            </span>
            <h1
              className="mt-3 text-2xl font-semibold text-slate-900"
              style={display}
            >
              {activeRecording?.title || "Select a lesson"}
            </h1>
            {activeRecording?.description && (
              <p className="mt-2 text-sm text-slate-500">
                {activeRecording.description}
              </p>
            )}
            {allRecordings.length > 0 && (
              <p className="mt-2 text-xs text-slate-400" style={mono}>
                Lesson {activeIndex + 1} of {allRecordings.length}
                {activeRecording?.moduleTitle
                  ? ` · ${activeRecording.moduleTitle}`
                  : ""}
              </p>
            )}
          </div>
        </div>

        {/* Course content sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white h-fit shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
              <Layers className="w-4 h-4 text-sky-600" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Course content
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {allRecordings.length} lessons across {modules.length} modules
              </p>
            </div>
          </div>

          <div className="sm:max-h-[70vh] sm:overflow-y-auto">
            {modules.map((module) => {
              const isExpanded = expandedModuleIds.has(module.id);
              return (
                <div key={module.id}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-start gap-2 px-4 py-3 bg-sky-50/70 border-y border-sky-100 border-l-[3px] border-l-sky-500 text-left"
                  >
                    <Layers className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold text-sky-700 uppercase tracking-wide leading-relaxed line-clamp-2 wrap-break-words"
                        style={mono}
                      >
                        {module.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-sky-500/70 normal-case">
                        {module.recordings.length} lesson
                        {module.recordings.length === 1 ? "" : "s"}
                        {module.notes?.length > 0 &&
                          ` · ${module.notes.length} note${
                            module.notes.length === 1 ? "" : "s"
                          }`}
                        {module.attachments?.length > 0 &&
                          ` · ${module.attachments.length} file${
                            module.attachments.length === 1 ? "" : "s"
                          }`}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-sky-500 shrink-0 mt-0.5 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <>
                      <ul className="divide-y divide-slate-100">
                        {module.recordings.length === 0 && (
                          <li className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5" />
                            No lessons published yet
                          </li>
                        )}
                        {module.recordings.map((rec) => {
                          const isActive = rec.id === activeRecordingId;
                          return (
                            <li key={rec.id}>
                              <button
                                onClick={() => setActiveRecordingId(rec.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  isActive ? "bg-sky-50" : "hover:bg-sky-50"
                                }`}
                              >
                                {isActive ? (
                                  <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm truncate ${
                                      isActive
                                        ? "font-semibold text-slate-900"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {rec.title}
                                  </p>
                                  {rec.duration && (
                                    <p className="text-xs text-slate-400">
                                      {rec.duration}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {/* NEW: read-only notes for this module */}
                      {module.notes?.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50">
                          <div className="px-4 py-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span
                              className="text-xs font-semibold uppercase text-slate-500"
                              style={mono}
                            >
                              Notes
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({module.notes.length})
                            </span>
                          </div>
                          <div className="pb-2 px-2 space-y-0.5">
                            {module.notes.map((note) => (
                              <StudentNoteItem key={note.id} note={note} />
                            ))}
                          </div>
                        </div>
                      )}

                      {module.attachments?.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50">
                          <div className="px-4 py-2 flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-purple-600" />
                            <span
                              className="text-xs font-semibold uppercase text-slate-500"
                              style={mono}
                            >
                              Attachments
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({module.attachments.length})
                            </span>
                          </div>

                          <div className="pb-2">
                            {module.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center justify-between px-4 py-3 hover:bg-purple-50 transition group"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-purple-600 font-medium hidden sm:block">
                                    Download
                                  </span>
                                  <Download className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {modules.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                No modules available for this course yet.
              </p>
            )}
          </div>
        </aside>

        {/* Reviews & ratings */}
        {courseId && (
          <div className="[grid-area:reviews]">
            <ReviewsSection courseId={courseId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecordings;
