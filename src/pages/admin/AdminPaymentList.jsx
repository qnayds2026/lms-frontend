import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  IndianRupee,
  CheckCircle,
  XCircle,
  Search,
  Wallet,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
  X,
  AlertTriangle,
  User,
  BookOpen,
  Calendar,
  Hash,
} from "lucide-react";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-600",
};

const STATUS_DOT = {
  SUCCESS: "bg-emerald-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
};

function initialsOf(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S"
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500",
    red: "bg-red-50 text-red-600 group-hover:bg-red-600",
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60 transition">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${colors[color]} group-hover:text-white`}
      >
        {icon}
      </div>
      <p className="text-slate-500 mt-4 text-sm">{title}</p>
      <h2
        className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1"
        style={display}
      >
        {value}
      </h2>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

// View details modal — matches the pattern used on Users/Courses pages
function PaymentDetailsModal({ payment, onClose }) {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={display}
            >
              Payment Details
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <span
                className="h-16 w-16 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg font-semibold"
                style={display}
              >
                {initialsOf(payment.student?.name)}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">
                {payment.student?.name || "—"}
              </h3>
              <p className="text-xs text-slate-400">{payment.student?.email}</p>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  STATUS_STYLES[payment.status] || "bg-slate-100 text-slate-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    STATUS_DOT[payment.status] || "bg-slate-400"
                  }`}
                />
                {payment.status?.charAt(0) +
                  payment.status?.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-700 truncate">
                  {payment.course?.title || "—"}
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-700 font-medium">
                  ₹{Number(payment.amount).toLocaleString("en-IN")} ·{" "}
                  {payment.paymentMethod}
                </p>
              </div>
              {payment.transactionId && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-700 truncate" style={mono}>
                    {payment.transactionId}
                  </p>
                </div>
              )}
              {(payment.createdAt || payment.paidAt) && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-700">
                    {new Date(
                      payment.paidAt || payment.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reject confirmation modal — matches the delete-confirm pattern used elsewhere
function RejectConfirmModal({ payment, onClose, onConfirm, rejecting }) {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 text-lg">
            Reject this payment?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {payment.student?.name
              ? `${payment.student.name}'s payment of ₹${Number(payment.amount).toLocaleString("en-IN")} will be marked as failed.`
              : "This payment will be marked as failed."}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={rejecting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminPaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      setPayments(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const updateStatus = async (paymentId, status) => {
    try {
      setUpdatingId(paymentId);
      await api.patch(`/payments/${paymentId}/status`, { status });
      // Update locally instead of a full refetch, avoids a loading flash
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status } : p)),
      );
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to update payment");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    try {
      setRejecting(true);
      await api.patch(`/payments/${rejectTarget.id}/status`, {
        status: "FAILED",
      });
      setPayments((prev) =>
        prev.map((p) =>
          p.id === rejectTarget.id ? { ...p, status: "FAILED" } : p,
        ),
      );
      setRejectTarget(null);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to reject payment");
    } finally {
      setRejecting(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const successCount = payments.filter((p) => p.status === "SUCCESS").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.student?.name?.toLowerCase().includes(q) ||
      p.student?.email?.toLowerCase().includes(q) ||
      p.course?.title?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
          style={mono}
        >
          admin_panel
        </span>
        <h1
          className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900"
          style={display}
        >
          Payment Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Review and approve student payments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={<Wallet className="w-5 h-5" />}
          color="sky"
        />
        <StatCard
          title="Successful"
          value={successCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Failed"
          value={failedCount}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, email, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <Receipt className="w-9 h-9 mx-auto text-slate-300" />
            <p className="mt-4 text-slate-500 text-sm">No payments found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Student
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden md:table-cell">
                      Course
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Amount
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden sm:table-cell">
                      Method
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 font-medium text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
                            style={display}
                          >
                            {initialsOf(payment.student?.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {payment.student?.name || "—"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {payment.student?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell max-w-50 truncate">
                        {payment.course?.title || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {Number(payment.amount).toLocaleString("en-IN")}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span
                          className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs"
                          style={mono}
                        >
                          {payment.paymentMethod}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_STYLES[payment.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              STATUS_DOT[payment.status] || "bg-slate-400"
                            }`}
                          />
                          {payment.status?.charAt(0) +
                            payment.status?.slice(1).toLowerCase()}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingPayment(payment)}
                            title="View"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition shrink-0"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {payment.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(payment.id, "SUCCESS")
                                }
                                disabled={updatingId === payment.id}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-xs font-medium transition"
                              >
                                {updatingId === payment.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() => setRejectTarget(payment)}
                                className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-medium transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400" style={mono}>
                showing {rangeStart}-{rangeEnd} of {filtered.length}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1.5 text-slate-300 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition ${
                          p === page
                            ? "bg-sky-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <PaymentDetailsModal
        payment={viewingPayment}
        onClose={() => setViewingPayment(null)}
      />

      <RejectConfirmModal
        payment={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        rejecting={rejecting}
      />
    </div>
  );
};

export default AdminPaymentList;
