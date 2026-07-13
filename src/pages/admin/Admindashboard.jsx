import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CreditCard,
  Terminal,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import api from "../../api/axios";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const SKY = "#0284c7";
const SKY_SOFT = "rgba(2, 132, 199, 0.12)";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const SLATE = "#94a3b8";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-32 animate-pulse" />
  );
}

function ChartCardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 h-80 animate-pulse ${className}`}
    />
  );
}

// Builds the last `months` calendar-month buckets, e.g. ["Feb", "Mar", ... "Jul"]
function buildLastMonths(months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("default", { month: "short" }),
    });
  }
  return buckets;
}

const baseChartFont = { family: "'Inter', sans-serif", size: 11 };

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, paymentsRes, enrollmentsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/payments"),
          api.get("/enrollments"),
        ]);
        setCourses(coursesRes.data || []);
        setPayments(paymentsRes.data?.data || []);
        setEnrollments(enrollmentsRes.data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;

  // ---- Chart data derivations ----

  const revenueTrend = useMemo(() => {
    const months = buildLastMonths(6);
    const totals = Object.fromEntries(months.map((m) => [m.key, 0]));

    payments.forEach((p) => {
      if (p.status !== "SUCCESS" && p.status !== "COMPLETED") return;
      const raw = p.createdAt || p.date;
      if (!raw) return;
      const d = new Date(raw);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in totals) totals[key] += Number(p.amount || 0);
    });

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Revenue",
          data: months.map((m) => totals[m.key]),
          borderColor: SKY,
          backgroundColor: SKY_SOFT,
          pointBackgroundColor: SKY,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [payments]);

  const paymentStatusBreakdown = useMemo(() => {
    const counts = {};
    payments.forEach((p) => {
      const status = p.status || "UNKNOWN";
      counts[status] = (counts[status] || 0) + 1;
    });

    const colorMap = {
      SUCCESS: EMERALD,
      COMPLETED: EMERALD,
      PENDING: AMBER,
      FAILED: RED,
      UNKNOWN: SLATE,
    };

    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => counts[l]),
          backgroundColor: labels.map((l) => colorMap[l] || SLATE),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
      total: payments.length,
    };
  }, [payments]);

  const enrollmentTrend = useMemo(() => {
    const months = buildLastMonths(6);
    const totals = Object.fromEntries(months.map((m) => [m.key, 0]));

    enrollments.forEach((e) => {
      const raw = e.createdAt || e.enrolledAt;
      if (!raw) return;
      const d = new Date(raw);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in totals) totals[key] += 1;
    });

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Enrollments",
          data: months.map((m) => totals[m.key]),
          backgroundColor: SKY,
          borderRadius: 6,
          maxBarThickness: 28,
        },
      ],
    };
  }, [enrollments]);

  const topCourses = useMemo(() => {
    const counts = {};
    enrollments.forEach((e) => {
      const id = e.courseId || e.course?.id;
      const title = e.course?.title || e.courseTitle;
      if (!id) return;
      if (!counts[id])
        counts[id] = { title: title || "Untitled course", count: 0 };
      counts[id].count += 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [enrollments]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: baseChartFont,
        bodyFont: baseChartFont,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: baseChartFont, color: "#94a3b8" },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: {
          font: baseChartFont,
          color: "#94a3b8",
          callback: (v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: baseChartFont,
        bodyFont: baseChartFont,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: baseChartFont, color: "#94a3b8" },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { font: baseChartFont, color: "#94a3b8", precision: 0 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: baseChartFont,
          color: "#475569",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: baseChartFont,
        bodyFont: baseChartFont,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> admin_session
      </span>
      <h1
        className="mt-3 text-3xl font-semibold text-slate-900"
        style={display}
      >
        {getGreeting()} 👋
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm">
        Platform overview across courses, payments, and enrollments.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Link
              to="/admin/courses"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">
                Published Courses
              </h3>
              <p
                className="text-4xl font-semibold text-slate-900 mt-1"
                style={display}
              >
                {courses.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400" style={mono}>
                drafts not counted yet
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">
                Total Enrollments
              </h3>
              <p
                className="text-4xl font-semibold text-slate-900 mt-1"
                style={display}
              >
                {enrollments.length}
              </p>
            </Link>

            <Link
              to="/admin/payments"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">
                Total Revenue
              </h3>
              <p
                className="text-4xl font-semibold text-slate-900 mt-1"
                style={display}
              >
                ₹{totalRevenue.toLocaleString()}
              </p>
            </Link>

            <Link
              to="/admin/payments"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-500">
                Pending Payments
              </h3>
              <p
                className="text-4xl font-semibold text-slate-900 mt-1"
                style={display}
              >
                {pendingPayments}
              </p>
            </Link>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        {loading ? (
          <>
            <ChartCardSkeleton className="lg:col-span-2" />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-600 text-xs font-medium" style={mono}>
                    last_6_months
                  </p>
                  <h2
                    className="mt-1 text-base sm:text-lg font-semibold text-slate-900"
                    style={display}
                  >
                    Revenue Trend
                  </h2>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900">
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="h-64 mt-4">
                <Line data={revenueTrend} options={lineOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <p className="text-sky-600 text-xs font-medium" style={mono}>
                all_time
              </p>
              <h2
                className="mt-1 text-base sm:text-lg font-semibold text-slate-900"
                style={display}
              >
                Payment Status
              </h2>
              <div className="h-64 mt-2 relative">
                {paymentStatusBreakdown.total === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No payments yet
                  </div>
                ) : (
                  <>
                    <Doughnut
                      data={paymentStatusBreakdown}
                      options={doughnutOptions}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                      <span
                        className="text-2xl font-bold text-slate-900"
                        style={display}
                      >
                        {paymentStatusBreakdown.total}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        transactions
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        {loading ? (
          <>
            <ChartCardSkeleton className="lg:col-span-2" />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <p className="text-sky-600 text-xs font-medium" style={mono}>
                last_6_months
              </p>
              <h2
                className="mt-1 text-base sm:text-lg font-semibold text-slate-900"
                style={display}
              >
                Enrollments
              </h2>
              <div className="h-64 mt-4">
                <Bar data={enrollmentTrend} options={barOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <p className="text-sky-600 text-xs font-medium" style={mono}>
                by_enrollments
              </p>
              <h2
                className="mt-1 text-base sm:text-lg font-semibold text-slate-900"
                style={display}
              >
                Top Courses
              </h2>
              {topCourses.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-slate-400">
                  No enrollment data yet
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {topCourses.map((c, i) => (
                    <div key={c.title} className="flex items-center gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700 text-[11px] font-semibold"
                        style={display}
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 min-w-0 text-sm text-slate-700 truncate">
                        {c.title}
                      </p>
                      <span className="text-sm font-medium text-slate-900 shrink-0">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/admin/courses"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              courses
            </p>
            <h2
              className="mt-1 text-lg font-semibold text-slate-900"
              style={display}
            >
              Manage Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Publish, unpublish, or remove courses.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </Link>

        <Link
          to="/admin/payments"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              payments
            </p>
            <h2
              className="mt-1 text-lg font-semibold text-slate-900"
              style={display}
            >
              Review Payments
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Approve manual payments, view all transactions.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </Link>

        <Link
          to="/admin/live-classes"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              live_classes
            </p>
            <h2
              className="mt-1 text-lg font-semibold text-slate-900"
              style={display}
            >
              Live Classes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Oversee scheduled sessions platform-wide.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
