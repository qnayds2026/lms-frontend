import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CreditCard,
  Video,
  Terminal,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCardSkeleton() {
  return <div className="bg-white rounded-2xl border border-slate-200 h-32 animate-pulse" />;
}

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
        // NOTE: using the public GET /courses endpoint, which per
        // course.controllers.js filters to isPublished: true only.
        // If you have a separate "all courses including drafts" endpoint
        // for admins, swap this line to call that instead — tell me the
        // exact path and I'll update it.
        const [coursesRes, paymentsRes, enrollmentsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/payments"),
          api.get("/enrollments"),
        ]);
        setCourses(coursesRes.data || []);
        setPayments(paymentsRes.data?.data || []);
        setEnrollments(enrollmentsRes.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
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

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
        style={mono}
      >
        <Terminal className="w-3.5 h-3.5" /> admin_session
      </span>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
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
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
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
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
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
              <h3 className="mt-5 text-sm font-medium text-slate-500">Total Revenue</h3>
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
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
              <p className="text-4xl font-semibold text-slate-900 mt-1" style={display}>
                {pendingPayments}
              </p>
            </Link>
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/admin/courses"
          className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
        >
          <div>
            <p className="text-sky-600 text-xs font-medium" style={mono}>
              courses
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900" style={display}>
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
            <h2 className="mt-1 text-lg font-semibold text-slate-900" style={display}>
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
            <h2 className="mt-1 text-lg font-semibold text-slate-900" style={display}>
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