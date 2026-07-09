import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  Lock,
  Terminal,
} from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const StudentRecordings = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeRecordingId, setActiveRecordingId] = useState(null);
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

        const recordingsByModule = await Promise.all(
          moduleList.map((m) =>
            api
              .get(`/recordings/module/${m.id}`)
              .then((res) => res.data)
              .catch(() => []),
          ),
        );

        const modulesWithRecordings = moduleList.map((m, i) => ({
          id: m.id,
          title: m.title,
          recordings: recordingsByModule[i] || [],
        }));

        setModules(modulesWithRecordings);

        const firstRecording = modulesWithRecordings.find(
          (m) => m.recordings.length > 0,
        )?.recordings[0];
        if (firstRecording) setActiveRecordingId(firstRecording.id);
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <style>{FONT_IMPORT}</style>

      <Link
        to="/student/my-courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to My Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Video area — YouTube embed */}
        <div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg shadow-slate-200">
            {activeRecording?.videoId ? (
              <iframe
                key={activeRecording.id}
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${activeRecording.videoId}`}
                title={activeRecording.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40 text-sm px-6 text-center">
                No video available for this lesson yet.
              </div>
            )}
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
        <aside className="rounded-2xl border border-slate-200 bg-white h-fit shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Course content
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {allRecordings.length} lessons across {modules.length} modules
            </p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {modules.map((module) => (
              <div key={module.id}>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <p
                    className="text-xs font-semibold text-slate-500 uppercase"
                    style={mono}
                  >
                    {module.title}
                  </p>
                </div>
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
              </div>
            ))}

            {modules.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                No modules available for this course yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentRecordings;
