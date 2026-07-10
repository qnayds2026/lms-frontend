import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  BookOpen,
  BarChart2,
  Bell,
  Video,
  Compass,
  GraduationCap,
  BellRing,
  ArrowRight,
  Terminal,
  Clock,
  Layers,
  Radio,
  Videotape,
  Star,
  Heart,
  Check,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const STAT_CARDS = [
  {
    key: "enrolledCourses",
    label: "Enrolled Courses",
    icon: BookOpen,
    color: "sky",
  },
  {
    key: "unreadNotifications",
    label: "Notifications",
    icon: Bell,
    color: "amber",
  },
  {
    key: "upcomingLiveClasses",
    label: "Live Classes",
    icon: Video,
    color: "emerald",
  },
];

const COLOR_MAP = {
  sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
};

const ACTIONS = [
  { label: "Browse Courses", icon: Compass, primary: true, path: "/courses" },
  {
    label: "My Courses",
    icon: GraduationCap,
    primary: false,
    path: "/student/my-courses",
  },
  {
    label: "Live Classes",
    icon: Radio,
    primary: false,
    path: "/student/live-classes",
  },
  {
    label: "Notifications",
    icon: BellRing,
    primary: false,
    path: "/student/notifications",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="h-4 w-48 bg-slate-100 rounded-lg mt-3" />
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-6 h-36"
          />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 h-48"
          />
        ))}
      </div>
    </div>
  );
}
function CourseCard({ course }) {
  const [wishlisted, setWishlisted] = useState(false);
  const priceLabel =
    course.price && course.price !== 0 ? `₹${course.price}` : "Free";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-36 sm:h-40 bg-linear-to-br from-sky-50 to-slate-50 border-b border-slate-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-7 h-7 text-sky-300" />
          </div>
        )}

        {course.category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-sky-700 text-[10px] font-medium uppercase tracking-wide"
            style={mono}
          >
            {course.category}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur hover:bg-white transition"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500"
            }`}
          />
        </button>

        {/* Progress bar — only for enrolled/in-progress courses */}
        {typeof course.progress === "number" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40">
            <div
              className="h-full bg-sky-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 leading-snug text-sm sm:text-base line-clamp-2 group-hover:text-sky-700 transition-colors">
          {course.title || "Untitled course"}
        </h3>

        {course.instructor && (
          <p className="mt-1.5 text-xs text-slate-400 truncate">
            by {course.instructor?.name || course.instructor}
          </p>
        )}

        {/* Rating + level, always visible */}
        {(course.rating || course.level) && (
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {course.rating && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-amber-600">
                  {course.rating}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(course.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                {course.reviewsCount && (
                  <span className="text-xs text-slate-400">
                    ({course.reviewsCount})
                  </span>
                )}
              </div>
            )}
            {course.level && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <BarChart2 className="w-3 h-3" />
                {course.level}
              </span>
            )}
          </div>
        )}

        {course.description && (
          <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {course.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </span>
            )}
            <span className="text-base font-bold text-slate-900 mt-0.5">
              {priceLabel}
            </span>
          </div>

          <button className="inline-flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg transition shrink-0">
            {typeof course.progress === "number" ? "Continue" : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/student");
      setDashboard(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data || res.data.courses || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            <Terminal className="w-3.5 h-3.5" /> student_session
          </span>
          <h1
            className="mt-3 text-3xl font-semibold text-slate-900"
            style={display}
          >
            {getGreeting()} 👋
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Continue your learning journey right where you left off.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5 mt-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${COLOR_MAP[color]} group-hover:text-white`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="mt-5 text-sm font-medium text-slate-500">{label}</h3>
            <p
              className="text-4xl font-semibold text-slate-900 mt-1"
              style={display}
            >
              {dashboard?.[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <p className="text-sky-600 text-xs font-medium" style={mono}>
          quick_actions
        </p>
        <h2
          className="mt-1.5 text-xl font-semibold text-slate-900"
          style={display}
        >
          Where to next?
        </h2>

        <div className="flex flex-wrap gap-4 mt-5">
          {ACTIONS.map(({ label, icon: Icon, primary, path }) => (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition ${
                primary
                  ? "bg-sky-600 hover:bg-sky-700 text-white"
                  : "border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 bg-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {primary && <ArrowRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Explore courses */}
      <div className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              from_the_catalog
            </p>
            <h2
              className="mt-1.5 text-xl font-semibold text-slate-900"
              style={display}
            >
              Explore courses
            </h2>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-sm font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {coursesLoading ? (
          <div className="grid md:grid-cols-3 gap-5 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-5 mt-5">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-5 bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No courses available yet — check back soon.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
