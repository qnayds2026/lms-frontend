import { useEffect, useState } from "react";
import { Video, Calendar, Clock, ExternalLink, Radio } from "lucide-react";
import axiosInstance from "../api/axios";

// Replace this with however you already fetch the student's enrolled courses,
// e.g. from GET /api/enrollments/me — needs an array of course IDs.
const ENROLLED_COURSE_IDS = [1, 2, 3];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAllLiveClasses() {
      setLoading(true);
      setError("");
      try {
        const results = await Promise.all(
          ENROLLED_COURSE_IDS.map((courseId) =>
            axiosInstance
              .get(`/liveclasses/course/${courseId}`)
              .then((res) => res.data)
              .catch((err) => {
                // Skip courses the student isn't actively enrolled in (403)
                // or that don't exist (404), without failing the whole page.
                if (err?.response?.status === 403 || err?.response?.status === 404) {
                  return [];
                }
                throw err;
              })
          )
        );
        setClasses(results.flat());
      } catch (err) {
        setError(
          err?.response?.data?.error || "Failed to load live classes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAllLiveClasses();
  }, []);

  const upcoming = classes
    .filter((c) => c.status === "SCHEDULED" || c.status === "LIVE")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const ended = classes
    .filter((c) => c.status === "ENDED")
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Join scheduled sessions for the courses you're enrolled in.
        </p>

        {loading && (
          <p className="text-sm text-slate-400 py-10 text-center">Loading live classes...</p>
        )}

        {error && (
          <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Upcoming / Live */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]/10">
                      {cls.status === "LIVE" ? (
                        <Radio className="h-5 w-5 text-red-500" />
                      ) : (
                        <Video className="h-5 w-5 text-[#0284c7]" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {cls.title}
                        </p>
                        {cls.status === "LIVE" && (
                          <span className="text-[10px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            Live now
                          </span>
                        )}
                      </div>
                      {cls.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {cls.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(cls.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(cls.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={cls.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[#0284c7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] transition-colors"
                    >
                      Join
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
                {upcoming.length === 0 && (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No upcoming live classes scheduled.
                  </p>
                )}
              </div>
            </div>

            {/* Ended */}
            {ended.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Past Classes</h2>
                <div className="space-y-3">
                  {ended.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 opacity-75"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Video className="h-5 w-5 text-slate-400" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {cls.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(cls.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(cls.scheduledAt)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        Ended
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}