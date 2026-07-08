import { useEffect, useState } from "react";
import { Video, Calendar, Clock, ExternalLink, Radio, Terminal } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

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

function ClassRowSkeleton() {
  return <div className="bg-white rounded-2xl border border-slate-200 h-20 animate-pulse" />;
}

const StudentLiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAllLiveClasses() {
      setLoading(true);
      setError("");
      try {
        const enrollRes = await api.get("/enrollments/my-courses");
        const enrollments = enrollRes.data?.data || [];

        const courseIds = enrollments
          .map((item) => item.course?.id ?? item.courseId ?? item.id)
          .filter(Boolean);

        if (courseIds.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          courseIds.map((courseId) =>
            api
              .get(`/liveclasses/course/${courseId}`)
              .then((res) => res.data)
              .catch((err) => {
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
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load live classes. Please try again."
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
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> live_classes
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
        Live Classes
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        Join scheduled sessions for the courses you're enrolled in.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upcoming */}
      <div className="mt-8">
        <p className="text-sky-600 text-xs font-medium" style={mono}>
          upcoming
        </p>
        <div className="mt-4 space-y-3">
          {loading && [0, 1].map((i) => <ClassRowSkeleton key={i} />)}

          {!loading &&
            !error &&
            upcoming.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                  {cls.status === "LIVE" ? (
                    <Radio className="h-5 w-5 text-red-500" />
                  ) : (
                    <Video className="h-5 w-5 text-sky-600" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {cls.title}
                    </p>
                    {cls.status === "LIVE" && (
                      <span
                        className="text-[10px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded"
                        style={mono}
                      >
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
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors"
                >
                  Join
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}

          {!loading && !error && upcoming.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
              No upcoming live classes scheduled.
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      {!loading && ended.length > 0 && (
        <div className="mt-10">
          <p className="text-sky-600 text-xs font-medium" style={mono}>
            past_classes
          </p>
          <div className="mt-4 space-y-3">
            {ended.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 opacity-75"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Video className="h-5 w-5 text-slate-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{cls.title}</p>
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
                <span className="shrink-0 text-xs font-medium text-slate-400">Ended</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLiveClasses;