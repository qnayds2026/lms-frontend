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
  X,
  Share2,
} from "lucide-react";
import PaymentModal from "../../components/student/PaymentModal";

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
  // { label: "Browse Courses", icon: Compass, primary: true },
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
  {
    label: "Certificates",
    icon: Star,
    primary: false,
    path: "/student/certificates",
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

// --- NEW: course details modal, opened by clicking a card ---
// --- NEW: renders course.description with basic markdown-style formatting
// (## headings, **bold**, ✅/✔️ bullet lists) instead of showing raw syntax ---
function parseInlineBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function FormattedText({ text, className = "" }) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const blocks = [];
  let currentList = null;

  lines.forEach((line, i) => {
    const isBullet = /^(✅|✔️|✔)\s*/.test(line);

    if (isBullet) {
      const content = line.replace(/^(✅|✔️|✔)\s*/, "");
      if (!currentList) {
        currentList = { type: "list", items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(content);
      return;
    }

    currentList = null;

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", content: line.slice(3) });
    } else {
      blocks.push({ type: "paragraph", content: line });
    }
  });

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h4
              key={i}
              className="mt-4 first:mt-0 text-sm font-semibold text-slate-900"
            >
              {parseInlineBold(block.content)}
            </h4>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="mt-2 space-y-1.5">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{parseInlineBold(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="mt-2 first:mt-0 text-sm text-slate-600 leading-relaxed"
          >
            {parseInlineBold(block.content)}
          </p>
        );
      })}
    </div>
  );
}

function CourseDetailsModal({ courseId, onClose, onEnroll }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/courses/${courseId}`)
      .then((res) => {
        if (!cancelled) setCourse(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Course not found"
              : err.message || "Failed to load course",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur text-slate-500 hover:text-slate-700 hover:bg-white transition shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {loading && (
          <div className="p-14 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Loading course...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-14 flex flex-col items-center justify-center gap-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && course && (
          <div className="p-6 sm:p-8">
            {course.thumbnail && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 mb-6">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {course.instructor?.name && (
              <p className="text-sm font-semibold text-sky-600 mb-1.5">
                {course.instructor.name}
              </p>
            )}

            <h2
              className="text-2xl font-semibold text-slate-900"
              style={display}
            >
              {course.title}
            </h2>

            {course.description && (
              <FormattedText text={course.description} className="mt-3" />
            )}

            {typeof course.price === "number" && (
              <p className="mt-5 text-xl font-semibold text-slate-900">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </p>
            )}

            {course.modules?.length > 0 && (
              <div className="mt-6">
                <h3
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3"
                  style={mono}
                >
                  Course Content
                </h3>
                <div className="space-y-2">
                  {course.modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="rounded-lg border border-slate-200 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {mod.title}
                      </p>
                      {mod.recordings?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {mod.recordings.length} lesson
                          {mod.recordings.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              {course.enrollmentStatus === "PENDING" ? (
                <span className="inline-block bg-amber-100 text-amber-700 px-5 py-3 rounded-lg text-sm font-medium">
                  ⏳ Waiting for Approval
                </span>
              ) : course.enrollmentStatus === "ACTIVE" ? (
                <span className="inline-block bg-green-100 text-green-700 px-5 py-3 rounded-lg text-sm font-medium">
                  ✓ Continue Learning
                </span>
              ) : (
                <button
                  onClick={() => {
                    onEnroll(course);
                    onClose();
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onEnroll, onOpenDetails }) {
  const [wishlisted, setWishlisted] = useState(false);
  const priceLabel =
    course.price && course.price !== 0 ? `₹${course.price}` : "Free";

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/courses/${course.id}`;

    const shareData = {
      title: course.title,
      text: `🚀 Check out this course on QNAYDS LMS!\n\n${course.title}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("Course link copied to clipboard!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(course)}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
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
            {course.description
              .replace(/[#*✅✔️✔]/g, "")
              .replace(/\s+/g, " ")
              .trim()}
          </p>
        )}

        {/* Footer */}
        <div className="flex  items-center gap-3 p-2">
          <button
            onClick={handleShare}
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 hover:border-sky-300 hover:text-sky-600 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {course.enrollmentStatus === "PENDING" ? (
            <div className="flex flex-col items-end">
              <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium">
                ⏳ Waiting for Approval
              </span>

              <p className="text-[11px] text-slate-400 mt-1">
                You'll be notified once approved.
              </p>
            </div>
          ) : course.enrollmentStatus === "ACTIVE" ? (
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              ✓ Continue Learning
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(course);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Enroll Now
            </button>
          )}
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailsCourseId, setDetailsCourseId] = useState(null);

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
      const res = await api.get("/courses/student");
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

  const handleManualPayment = async (course) => {
    try {
      await api.post("/payments/manual", {
        courseId: course.id,
        amount: Number(course.price),
      });

      alert(
        "Enrollment request submitted successfully. Waiting for admin approval.",
      );

      setPaymentOpen(false);
      await fetchCourses();
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to submit payment.");
    }
  };

  const handleOnlinePayment = async (course) => {
    try {
      const res = await api.post("/payments/create-order", {
        courseId: course.id,
      });
      console.log(res.data);

      const { order } = res.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "QNAYDS LMS",

        description: course.title,

        order_id: order.id,

        handler: function () {
          alert(
            "Payment successful. Your course access will be activated shortly.",
          );

          fetchCourses();
        },

        theme: {
          color: "#0284c7",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to create payment order");
    }
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setPaymentOpen(true);
  };

  const handleOpenDetails = (course) => {
    setDetailsCourseId(course.id ?? course._id);
  };

  CourseCard;

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
              <CourseCard
                key={course._id || course.id}
                course={course}
                onEnroll={handleEnrollClick}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No courses available yet — check back soon.
          </div>
        )}
      </div>
      <PaymentModal
        open={paymentOpen}
        course={selectedCourse}
        onClose={() => setPaymentOpen(false)}
        onManualPayment={handleManualPayment}
        onOnlinePayment={handleOnlinePayment}
      />

      {detailsCourseId && (
        <CourseDetailsModal
          courseId={detailsCourseId}
          onClose={() => setDetailsCourseId(null)}
          onEnroll={handleEnrollClick}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
