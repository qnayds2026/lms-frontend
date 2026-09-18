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
  Play,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import api from "../../api/axios";
import CourseProgress from "../../components/student/CourseProgress";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// ======================================================
// STAR RATING
// ======================================================

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
            className={`${size} transition-colors ${n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

// ======================================================
// REVIEWS
// IMPORTANT: Progress has been removed from here.
// ======================================================

function ReviewsSection({ courseId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dropdown open / close
  const [isOpen, setIsOpen] = useState(false);

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
    if (courseId) {
      fetchReviews();
    }

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
      setError(
        err?.response?.data?.error ||
        "Failed to save your review."
      );
    } finally {
      setSaving(false);
    }
  };

  const otherReviews = (data?.reviews || []).filter(
    (r) => r.id !== data?.myReview?.id
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

      {/* ==================================================
          COMPACT REVIEW HEADER
      ================================================== */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
              <MessageSquare className="h-5 w-5 text-sky-600" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Reviews &amp; Ratings
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {data?.totalReviews || 0} student review
                {data?.totalReviews === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Rating */}
            <div className="hidden sm:flex items-center gap-2">

              <span
                className="text-lg font-semibold text-slate-900"
                style={display}
              >
                {data?.totalReviews > 0
                  ? data.averageRating.toFixed(1)
                  : "—"}
              </span>

              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <
                        Math.round(
                          data?.averageRating || 0
                        )
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* View */}
            <span className="hidden sm:block text-xs font-medium text-sky-600">
              {isOpen ? "Hide" : "View"}
            </span>

            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>

        {/* Mobile rating */}
        <div className="mt-3 flex items-center gap-2 sm:hidden">
          <span
            className="text-lg font-semibold text-slate-900"
            style={display}
          >
            {data?.totalReviews > 0
              ? data.averageRating.toFixed(1)
              : "—"}
          </span>

          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i <
                    Math.round(
                      data?.averageRating || 0
                    )
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                  }`}
              />
            ))}
          </div>

          <span className="text-xs text-slate-400">
            {data?.totalReviews || 0} reviews
          </span>
        </div>
      </button>

      {/* ==================================================
          EXPANDED CONTENT
      ================================================== */}

      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-5 sm:px-6">

          {loading ? (
            <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <>
              {/* ================================
                  RATING SUMMARY
              ================================= */}

              <div className="flex items-center gap-4">

                <div className="text-center">
                  <div
                    className="text-4xl font-bold text-slate-900"
                    style={display}
                  >
                    {data?.totalReviews > 0
                      ? data.averageRating.toFixed(1)
                      : "—"}
                  </div>

                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i <
                            Math.round(
                              data?.averageRating || 0
                            )
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                          }`}
                      />
                    ))}
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {data?.totalReviews || 0} reviews
                  </p>
                </div>

              </div>

              {/* ================================
                  REVIEW FORM
              ================================= */}

              <form
                onSubmit={handleSubmit}
                className="mt-6 pt-5 border-t border-slate-100"
              >

                <p
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  style={mono}
                >
                  {data?.myReview
                    ? "Edit your review"
                    : "Rate this course"}
                </p>

                {/* Stars */}
                <div className="mt-3">
                  <StarRatingInput
                    value={myRating}
                    onChange={setMyRating}
                  />
                </div>

                {/* Comment */}
                <textarea
                  value={myComment}
                  onChange={(e) =>
                    setMyComment(e.target.value)
                  }
                  placeholder="Share your thoughts about this course..."
                  rows={3}
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    resize-none
                    transition
                    focus:border-sky-500
                    focus:ring-4
                    focus:ring-sky-100
                  "
                />

                {/* Error */}
                {error && (
                  <p className="mt-2 text-xs text-red-600">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="
                    mt-3
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    bg-sky-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-sky-700
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {saving
                    ? "Saving..."
                    : data?.myReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>
              </form>

              {/* ================================
                  OTHER REVIEWS
              ================================= */}

              {otherReviews.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Student Reviews
                    </h3>

                    <span className="text-xs text-slate-400">
                      {otherReviews.length} reviews
                    </span>
                  </div>

                  <div className="space-y-4">

                    {otherReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex gap-3"
                      >

                        {/* Avatar */}
                        <div className="
                          h-9
                          w-9
                          shrink-0
                          rounded-full
                          bg-sky-100
                          text-sky-700
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-semibold
                        ">
                          {review.student?.name?.[0]?.toUpperCase() ||
                            "?"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2 flex-wrap">

                            <p className="text-sm font-semibold text-slate-900">
                              {review.student?.name ||
                                "Student"}
                            </p>

                            <div className="flex">
                              {[...Array(5)].map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-200"
                                      }`}
                                  />
                                )
                              )}
                            </div>

                          </div>

                          {review.comment && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {review.comment}
                            </p>
                          )}

                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* No Reviews */}
              {otherReviews.length === 0 &&
                !data?.myReview && (
                  <div className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center">
                    <MessageSquare className="mx-auto h-5 w-5 text-slate-300" />

                    <p className="mt-2 text-sm text-slate-500">
                      No reviews yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Be the first student to review this course.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ======================================================
// STUDENT NOTE
// ======================================================

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
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""
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

// ======================================================
// STUDENT RECORDINGS
// ======================================================

const StudentRecordings = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  // Progress state belongs here
  const [courseProgress, setCourseProgress] = useState(null);
  const [completingRecording, setCompletingRecording] =
    useState(false);

  const [activeRecordingId, setActiveRecordingId] =
    useState(null);

  const [expandedModuleIds, setExpandedModuleIds] =
    useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // GET COURSE PROGRESS
  // ======================================================

  const fetchCourseProgress = async () => {
    if (!courseId) return;

    try {
      const res = await api.get(
        `/progress/course/${courseId}`
      );

      setCourseProgress(res.data?.data || null);
    } catch (err) {
      console.error(
        "Failed to fetch course progress:",
        err
      );
    }
  };

  // ======================================================
  // NATURAL SORTING HELPER
  // ======================================================

  const sortRecordingsNaturally = (recordings) => {
    return [...recordings].sort((a, b) => {
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      if (posA !== posB) return posA - posB;

      // If positions are equal, compare numerical part numbers in titles (e.g. "Part 1" vs "Part 2")
      const numA = (a.title?.match(/part\s*(\d+)/i) || [])[1];
      const numB = (b.title?.match(/part\s*(\d+)/i) || [])[1];
      if (numA && numB && Number(numA) !== Number(numB)) {
        return Number(numA) - Number(numB);
      }

      return (a.id ?? 0) - (b.id ?? 0);
    });
  };

  // ======================================================
  // FETCH COURSE + RECORDINGS
  // ======================================================

  useEffect(() => {
    async function fetchCourseAndRecordings() {
      setLoading(true);
      setError("");

      try {
        const courseRes = await api.get(
          `/courses/${courseId}`
        );

        const courseData = courseRes.data;
        setCourse(courseData);

        // 1. Strictly sort modules by position ASC, then id ASC
        const moduleList = (courseData?.modules || [])
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id);

        const moduleData = await Promise.all(
          moduleList.map(async (m) => {
            const rawRecs = await api
              .get(`/recordings/module/${m.id}`)
              .then((res) => (Array.isArray(res.data) ? res.data : []))
              .catch(() => []);

            // Ensure position is preserved from courseData if rawRecs omitted it
            const recordings = sortRecordingsNaturally(
              rawRecs.map((r) => {
                const matched = (m.recordings || []).find((mr) => mr.id === r.id);
                return {
                  ...r,
                  position: r.position ?? matched?.position ?? 0,
                };
              })
            );

            const attachments = await api
              .get(
                `/module-attachments/module/${m.id}`
              )
              .then(
                (res) =>
                  res.data?.data ||
                  res.data ||
                  []
              )
              .catch(() => []);

            const notes = await api
              .get(`/notes/module/${m.id}`)
              .then(
                (res) =>
                  res.data?.data ||
                  res.data ||
                  []
              )
              .catch(() => []);

            return {
              id: m.id,
              title: m.title,
              position: m.position,
              recordings,
              attachments,
              notes,
            };
          })
        );

        setModules(moduleData);

        // Fetch course progress immediately so we can open at the student's next uncompleted lesson
        let completedCount = 0;
        try {
          const progRes = await api.get(`/progress/course/${courseId}`);
          const progData = progRes.data?.data || null;
          setCourseProgress(progData);
          completedCount = Math.max(0, Number(progData?.completedLessons) || 0);
        } catch (e) {
          // Progress fetch handled in separate effect
        }

        const flatRecs = moduleData.flatMap((mod) =>
          mod.recordings.map((r) => ({
            ...r,
            moduleId: mod.id,
            moduleTitle: mod.title,
          }))
        );

        // Target next uncompleted lesson in exact order, or first lesson if starting fresh
        const targetRec =
          (completedCount > 0 && completedCount < flatRecs.length
            ? flatRecs[completedCount]
            : null) ||
          flatRecs[0];

        if (targetRec) {
          setActiveRecordingId(targetRec.id);
          if (targetRec.moduleId) {
            setExpandedModuleIds(new Set([targetRec.moduleId]));
          }
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          "Failed to load this course. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourseAndRecordings();
    }
  }, [courseId]);

  // ======================================================
  // FETCH PROGRESS
  // ======================================================

  useEffect(() => {
    if (courseId) {
      fetchCourseProgress();
    }
  }, [courseId]);

  // ======================================================
  // RECORDINGS LIST IN STRICT SEQUENTIAL ORDER
  // ======================================================

  const allRecordings = modules.flatMap((m) =>
    m.recordings.map((r) => ({
      ...r,
      moduleId: m.id,
      moduleTitle: m.title,
    }))
  );

  const activeIndex = allRecordings.findIndex(
    (r) => Number(r.id) === Number(activeRecordingId)
  );

  const activeRecording =
    activeIndex !== -1 ? allRecordings[activeIndex] : allRecordings[0] || null;

  const completedLessonsCount = Math.max(
    0,
    Number(courseProgress?.completedLessons) || 0
  );

  const isCurrentLessonCompleted =
    activeIndex !== -1 && activeIndex < completedLessonsCount;

  const hasNextLesson =
    activeIndex !== -1 && activeIndex < allRecordings.length - 1;

  const hasPrevLesson = activeIndex > 0;

  // ======================================================
  // COMPLETE ACTIVE RECORDING & LOAD NEXT IN ORDER
  // ======================================================

  const handleCompleteRecording = async () => {
    if (!activeRecordingId || completingRecording) {
      return;
    }

    try {
      setCompletingRecording(true);

      await api.post(
        `/progress/recordings/${activeRecordingId}/complete`
      );

      // Refresh overall course progress
      await fetchCourseProgress();

      // Find current recording index in sequential order
      const currIdx = allRecordings.findIndex(
        (r) => Number(r.id) === Number(activeRecordingId)
      );

      if (currIdx !== -1 && currIdx < allRecordings.length - 1) {
        const nextRecording = allRecordings[currIdx + 1];
        setActiveRecordingId(nextRecording.id);

        if (nextRecording.moduleId) {
          setExpandedModuleIds(
            (prev) => new Set([...prev, nextRecording.moduleId])
          );
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (currIdx !== -1 && currIdx === allRecordings.length - 1) {
        alert("🎉 Congratulations! You have completed all lessons in this course!");
      }
    } catch (err) {
      console.error(
        "Failed to complete recording:",
        err
      );

      alert(
        err?.response?.data?.message ||
        "Failed to update lesson progress."
      );
    } finally {
      setCompletingRecording(false);
    }
  };

  // ======================================================
  // DIRECT SEQUENTIAL NAVIGATION
  // ======================================================

  const goToNextLesson = () => {
    if (hasNextLesson) {
      const nextRec = allRecordings[activeIndex + 1];
      setActiveRecordingId(nextRec.id);
      if (nextRec.moduleId) {
        setExpandedModuleIds((prev) => new Set([...prev, nextRec.moduleId]));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevLesson = () => {
    if (hasPrevLesson) {
      const prevRec = allRecordings[activeIndex - 1];
      setActiveRecordingId(prevRec.id);
      if (prevRec.moduleId) {
        setExpandedModuleIds((prev) => new Set([...prev, prevRec.moduleId]));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ======================================================
  // YOUTUBE EMBED ENHANCER & AUTO-ADVANCE ON VIDEO END
  // ======================================================

  const getEnhancedEmbedUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/embed") || url.includes("youtu.be")) {
        const urlObj = new URL(url);
        // rel=0 ensures YouTube does not recommend random outside videos
        urlObj.searchParams.set("rel", "0");
        urlObj.searchParams.set("enablejsapi", "1");
        return urlObj.toString();
      }
    } catch (e) {}
    return url;
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        // YouTube API info=0 means video playback ended
        if (
          data &&
          (data.event === "onStateChange" || data.info === 0) &&
          data.info === 0
        ) {
          if (!completingRecording && activeRecordingId) {
            handleCompleteRecording();
          }
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeRecordingId, completingRecording, allRecordings]);

  // ======================================================
  // LEVEL SELECTION & VIDEO REDIRECTION
  // ======================================================

  const handleSelectLevel = (module) => {
    if (!module) return;

    // Check if module is locked
    const moduleIdx = modules.findIndex((m) => m.id === module.id);
    let remComp = Math.max(0, Number(courseProgress?.completedLessons) || 0);
    let prevDone = true;
    for (let i = 0; i < moduleIdx; i++) {
      const tot = modules[i].recordings?.length || 0;
      const comp = Math.min(remComp, tot);
      remComp -= comp;
      if (tot > 0 && comp < tot) {
        prevDone = false;
        break;
      }
    }

    if (moduleIdx > 0 && !prevDone) {
      alert(`Level ${moduleIdx + 1} is locked. Complete Level ${moduleIdx} first to unlock this level.`);
      return;
    }

    // Unlocked! Find first recording in this level module
    const recordings = module.recordings || [];
    if (recordings.length > 0) {
      setActiveRecordingId(recordings[0].id);
    }

    // Expand this module in the sidebar so it's open
    setExpandedModuleIds((prev) => new Set([...prev, module.id]));

    // Smoothly scroll to the top of the video player
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ======================================================
  // MODULE TOGGLE
  // ======================================================

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

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <style>{FONT_IMPORT}</style>

      {/* Back */}
      <Link
        to="/student/my-courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to My Courses
      </Link>

      {/* ==================================================
          COURSE PROGRESS
      ================================================== */}



      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_340px]
          gap-6
        "
      >
        {/* ==================================================
            VIDEO AREA
        ================================================== */}

        <div className="min-w-0">
          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
            <div
              className={
                activeRecording?.provider ===
                  "GOOGLE_DRIVE"
                  ? "w-full"
                  : "aspect-video w-full"
              }
              style={
                activeRecording?.provider ===
                  "GOOGLE_DRIVE"
                  ? { paddingBottom: "68%" }
                  : undefined
              }
            >
              {activeRecording?.embedUrl ? (
                <iframe
                  key={activeRecording.id}
                  className="absolute inset-0 h-full w-full"
                  src={getEnhancedEmbedUrl(activeRecording.embedUrl)}
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

              {activeRecording?.provider ===
                "GOOGLE_DRIVE" &&
                activeRecording?.embedUrl && (
                  <div
                    className="absolute top-0 right-0 h-14 w-16 z-10"
                    title="Opening in Drive is disabled"
                  />
                )}
            </div>
          </div>

          {/* ==================================================
              LESSON INFORMATION
          ================================================== */}

          <div className="mt-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
              style={mono}
            >
              <Terminal className="w-3.5 h-3.5" />
              {course?.title}
            </span>

            <h1
              className="mt-3 text-2xl font-semibold text-slate-900"
              style={display}
            >
              {activeRecording?.title ||
                "Select a lesson"}
            </h1>

            {activeRecording?.description && (
              <p className="mt-2 text-sm text-slate-500">
                {activeRecording.description}
              </p>
            )}

            {allRecordings.length > 0 && (
              <p
                className="mt-2 text-xs text-slate-400"
                style={mono}
              >
                Lesson {activeIndex + 1} of{" "}
                {allRecordings.length}
                {activeRecording?.moduleTitle
                  ? ` · ${activeRecording.moduleTitle}`
                  : ""}
              </p>
            )}
          </div>


          {/* ==================================================
              LESSON CONTROLS & COMPLETION
          ================================================== */}

          {activeRecording && (
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isCurrentLessonCompleted
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-sky-50 text-sky-600"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {isCurrentLessonCompleted ? (
                      <>
                        <span>Lesson Completed</span>
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Done
                        </span>
                      </>
                    ) : (
                      "Finished this lesson?"
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {isCurrentLessonCompleted
                      ? hasNextLesson
                        ? `Next in order: ${allRecordings[activeIndex + 1]?.title}`
                        : "You've completed all lessons in this course!"
                      : "Mark as completed to advance to the next video automatically in order."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Prev Lesson Button */}
                {hasPrevLesson && (
                  <button
                    type="button"
                    onClick={goToPrevLesson}
                    title="Go to previous lesson in order"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                )}

                {/* Mark as Complete or Next Button */}
                {!isCurrentLessonCompleted ? (
                  <button
                    type="button"
                    onClick={handleCompleteRecording}
                    disabled={completingRecording}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-sky-600
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-sky-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      shrink-0
                      shadow-sm
                    "
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completingRecording
                      ? "Saving..."
                      : hasNextLesson
                      ? "Mark Complete & Next"
                      : "Mark as Complete"}
                    {hasNextLesson && !completingRecording && (
                      <ArrowRight className="h-4 w-4 ml-0.5" />
                    )}
                  </button>
                ) : hasNextLesson ? (
                  <button
                    type="button"
                    onClick={goToNextLesson}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-emerald-600
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-emerald-700
                      shrink-0
                      shadow-sm
                    "
                  >
                    Next Lesson
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    All Lessons Completed!
                  </div>
                )}
              </div>
            </div>
          )}
          <CourseProgress
            progress={courseProgress}
            modules={modules}
            activeModuleId={activeRecording?.moduleId}
            onSelectLevel={handleSelectLevel}
          />

        </div>



        {/* ==================================================
            COURSE CONTENT SIDEBAR
        ================================================== */}

        <aside
          className="
            min-w-0
            rounded-2xl
            border border-slate-200
            bg-white
            h-fit
            shadow-sm
            overflow-hidden
          "
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
              <Layers className="w-4 h-4 text-sky-600" />
            </span>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Course content
              </h2>

              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {allRecordings.length} lessons across{" "}
                {modules.length} modules
              </p>
            </div>
          </div>

          <div className="sm:max-h-[70vh] sm:overflow-y-auto">
            {modules.map((module, moduleIdx) => {
              const isExpanded = expandedModuleIds.has(module.id);

              let remComp = Math.max(0, Number(courseProgress?.completedLessons) || 0);
              let prevModDone = true;
              for (let i = 0; i < moduleIdx; i++) {
                const tot = modules[i].recordings?.length || 0;
                const comp = Math.min(remComp, tot);
                remComp -= comp;
                if (tot > 0 && comp < tot) {
                  prevModDone = false;
                  break;
                }
              }
              const isModuleLocked = moduleIdx > 0 && !prevModDone;

              return (
                <div key={module.id}>
                  <button
                    onClick={() => {
                      if (isModuleLocked) {
                        alert(
                          `Level ${moduleIdx + 1} is locked. Complete Level ${moduleIdx} first to unlock.`
                        );
                      } else {
                        toggleModule(module.id);
                      }
                    }}
                    className={`w-full flex items-start gap-2 px-4 py-3 border-y text-left transition-colors ${
                      isModuleLocked
                        ? "bg-slate-50 border-slate-200 border-l-[3px] border-l-slate-300 opacity-70"
                        : "bg-sky-50/70 border-sky-100 border-l-[3px] border-l-sky-500 hover:bg-sky-50"
                    }`}
                  >
                    {isModuleLocked ? (
                      <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <Layers className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isModuleLocked ? "text-slate-400" : "text-sky-600"
                          }`}
                          style={mono}
                        >
                          Level {moduleIdx + 1}
                        </span>
                        {isModuleLocked && (
                          <span className="text-[9px] font-semibold uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            Locked
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs font-semibold uppercase tracking-wide leading-relaxed line-clamp-2 wrap-break-words mt-0.5 ${
                          isModuleLocked ? "text-slate-500" : "text-sky-700"
                        }`}
                        style={mono}
                      >
                        {module.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400 normal-case">
                        {module.recordings.length} lesson
                        {module.recordings.length === 1
                          ? ""
                          : "s"}
                        {module.notes?.length > 0 &&
                          ` · ${module.notes.length} note${module.notes.length === 1
                            ? ""
                            : "s"
                          }`}
                        {module.attachments?.length > 0 &&
                          ` · ${module.attachments.length} file${module.attachments.length === 1
                            ? ""
                            : "s"
                          }`}
                      </p>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 ${
                        isModuleLocked ? "text-slate-400" : "text-sky-500"
                      } shrink-0 mt-0.5 transition-transform duration-200 ${
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

                        {module.recordings.map(
                          (rec) => {
                            const isActive =
                              Number(rec.id) === Number(activeRecordingId);

                            const globalRecIdx = allRecordings.findIndex(
                              (r) => Number(r.id) === Number(rec.id)
                            );

                            const isRecCompleted =
                              globalRecIdx !== -1 &&
                              globalRecIdx < completedLessonsCount;

                            return (
                              <li key={rec.id}>
                                <button
                                  onClick={() => {
                                    if (isModuleLocked) {
                                      alert(
                                        `Level ${moduleIdx + 1} is locked. Complete Level ${moduleIdx} first to unlock.`
                                      );
                                    } else {
                                      setActiveRecordingId(rec.id);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                    isModuleLocked
                                      ? "cursor-not-allowed opacity-60 bg-slate-50"
                                      : isActive
                                      ? "bg-sky-50/90 border-l-[3px] border-l-sky-500 font-medium"
                                      : "hover:bg-sky-50/50"
                                  }`}
                                >
                                  {isModuleLocked ? (
                                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                                  ) : isRecCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                  ) : isActive ? (
                                    <Play className="h-4 w-4 text-sky-600 fill-current shrink-0 ml-0.5" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm truncate ${
                                        isActive
                                          ? "font-semibold text-sky-950"
                                          : isRecCompleted
                                          ? "font-medium text-slate-800"
                                          : "text-slate-600"
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
                          }
                        )}
                      </ul>

                      {/* NOTES */}
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
                            {module.notes.map(
                              (note) => (
                                <StudentNoteItem
                                  key={note.id}
                                  note={note}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* ATTACHMENTS */}
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
                            {module.attachments.map(
                              (attachment) => (
                                <a
                                  key={attachment.id}
                                  href={
                                    attachment.fileUrl
                                  }
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
                              )
                            )}
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
                No modules available for this
                course yet.
              </p>
            )}
          </div>
        </aside>



        {/* ==================================================
            REVIEWS — KEPT
        ================================================== */}

        {courseId && (
          <div className="min-w-0">
            <ReviewsSection
              courseId={courseId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecordings;