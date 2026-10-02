import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

const ProgramRegistrations = ({ program, onClose }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [matchingFilter, setMatchingFilter] = useState("ALL");

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/programs/${program.id}/registrations`,
      );

      setRegistrations(response?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
      setError(
        err?.response?.data?.message || "Failed to load registrations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [program.id]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    return registrations.filter((item) => {
      const matchesSearch =
        !value ||
        item.name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value);

      const status = item.certificateRequestStatus || "NONE";
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      const matchesMatching =
        matchingFilter === "ALL" ||
        (matchingFilter === "MATCHED"
          ? Boolean(item.studentId)
          : !item.studentId);

      return matchesSearch && matchesStatus && matchesMatching;
    });
  }, [registrations, search, statusFilter, matchingFilter]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {program.title} ({filtered.length} of {registrations.length})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="ALL">All Request Status</option>
            <option value="NONE">Not Requested</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={matchingFilter}
            onChange={(e) => setMatchingFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="ALL">All Matching Status</option>
            <option value="MATCHED">LMS Matched</option>
            <option value="NOT_MATCHED">Not Matched</option>
          </select>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
              Loading registrations...
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Unable to load registrations</p>
                <p className="mt-1">{error}</p>
              </div>
              <button
                onClick={fetchRegistrations}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <h3 className="text-base font-semibold text-slate-800">
                No registrations found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {registrations.length === 0
                  ? "Nobody has registered for this program yet."
                  : "Try changing the search or filters."}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">LMS Matching</th>
                    <th className="px-4 py-3">Certificate Request</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((item) => {
                    const status = item.certificateRequestStatus;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.email || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.phone || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.studentId ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <UserCheck className="h-3.5 w-3.5" />
                              Matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                              <UserX className="h-3.5 w-3.5" />
                              Not Matched
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              STATUS_STYLES[status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status
                              ? status.charAt(0) +
                                status.slice(1).toLowerCase()
                              : "Not requested"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramRegistrations;