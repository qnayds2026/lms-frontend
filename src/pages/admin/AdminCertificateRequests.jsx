import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock3,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "../../api/axios";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

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

const AdminCertificateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [programLoading, setProgramLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [matchingFilter, setMatchingFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // -----------------------------------------
  // MESSAGE
  // -----------------------------------------
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // -----------------------------------------
  // FETCH CERTIFICATE REQUESTS
  // -----------------------------------------
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await api.get(
        "/program-registrations/certificate-requests",
        { params },
      );

      setRequests(response?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch certificate requests:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load certificate requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // FETCH PROGRAMS FOR FILTER
  // -----------------------------------------
  const fetchPrograms = async () => {
    try {
      setProgramLoading(true);

      const response = await api.get("/programs");

      setPrograms(response?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    } finally {
      setProgramLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  // -----------------------------------------
  // SEARCH + FILTER
  // -----------------------------------------
  const filteredRequests = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !searchValue ||
        request.studentName?.toLowerCase().includes(searchValue) ||
        request.name?.toLowerCase().includes(searchValue) ||
        request.email?.toLowerCase().includes(searchValue);

      const matchesProgram =
        programFilter === "ALL" ||
        String(request.programId) === String(programFilter);

      const matchesMatching =
        matchingFilter === "ALL" ||
        (matchingFilter === "MATCHED"
          ? Boolean(request.studentId)
          : !request.studentId);

      return (
        matchesSearch &&
        matchesProgram &&
        matchesMatching
      );
    });
  }, [
    requests,
    search,
    programFilter,
    matchingFilter,
  ]);

useEffect(() => {
setCurrentPage(1);
}, [
  search,
  statusFilter,
  programFilter,
  matchingFilter,
  itemsPerPage,
]);
  // -----------------------------------------
// PAGINATION
// -----------------------------------------
const totalPages = Math.ceil(
  filteredRequests.length / itemsPerPage
);

const paginatedRequests = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return filteredRequests.slice(startIndex, endIndex);
}, [filteredRequests, currentPage, itemsPerPage]);

const startItem =
  filteredRequests.length === 0
    ? 0
    : (currentPage - 1) * itemsPerPage + 1;

const endItem = Math.min(
  currentPage * itemsPerPage,
  filteredRequests.length
);

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

  // -----------------------------------------
  // VIEW DETAILS
  // -----------------------------------------
  const handleViewDetails = async (request) => {
    try {
      setDetailsLoading(true);

      const response = await api.get(
        `/program-registrations/certificate-requests/${request.id}`,
      );

      setSelectedRequest(response?.data?.data || request);
    } catch (err) {
      console.error("Failed to fetch request details:", err);

      showMessage(
        err?.response?.data?.message ||
          "Failed to load request details.",
        "error",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // -----------------------------------------
  // APPROVE / REJECT
  // -----------------------------------------
  const handleAction = async (request, action) => {
    const actionText =
      action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} the certificate request from ${request.studentName || request.name}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(`${action}-${request.id}`);

      const endpoint =
        action === "approve"
          ? `/program-registrations/${request.id}/certificate-request/approve`
          : `/program-registrations/${request.id}/certificate-request/reject`;

      const response = await api.patch(endpoint);

      showMessage(
        response?.data?.message ||
          `Certificate request ${action}d successfully.`,
      );

      setSelectedRequest(null);

      await fetchRequests();
    } catch (err) {
      console.error(
        `Failed to ${action} certificate request:`,
        err,
      );

      showMessage(
        err?.response?.data?.message ||
          `Failed to ${action} certificate request.`,
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // -----------------------------------------
  // STATUS BADGE
  // -----------------------------------------
  const StatusBadge = ({ status }) => {
    if (status === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Clock3 className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  // -----------------------------------------
  // MATCHING BADGE
  // -----------------------------------------
  const MatchingBadge = ({ request }) => {
    if (request.studentId) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <UserCheck className="h-3.5 w-3.5" />
          Matched
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        <UserX className="h-3.5 w-3.5" />
        Not Matched
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div
          className={`fixed right-5 top-5 z-[70] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {messageType === "error" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}

          <span>{message}</span>

          <button onClick={() => setMessage("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-600">
            Admin
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Certificate Requests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review and manage student certificate requests.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Requests
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {requests.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {
                requests.filter(
                  (item) =>
                    item.requestStatus === "PENDING",
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {
                requests.filter(
                  (item) =>
                    item.requestStatus === "APPROVED",
                ).length
              }
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
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

          {/* Program */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="ALL">All Programs</option>

            {!programLoading &&
              programs.map((program) => (
                <option
                  key={program.id}
                  value={program.id}
                >
                  {program.title}
                </option>
              ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL"
                  ? "All Request Status"
                  : status}
              </option>
            ))}
          </select>

          {/* Matching */}
          <select
            value={matchingFilter}
            onChange={(e) =>
              setMatchingFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="ALL">
              All Matching Status
            </option>
            <option value="MATCHED">
              LMS Matched
            </option>
            <option value="NOT_MATCHED">
              Not Matched
            </option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">
              Unable to load certificate requests
            </p>

            <p className="mt-1">{error}</p>
          </div>

          <button
            onClick={fetchRequests}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            Loading certificate requests...
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        filteredRequests.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <Clock3 className="h-10 w-10 text-slate-300" />

            <h3 className="mt-3 text-base font-semibold text-slate-800">
              No certificate requests found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing the search or filters.
            </p>
          </div>
        )}

      {/* Table */}
      {!loading &&
        !error &&
        filteredRequests.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Program
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      LMS Matching
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Request Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Request Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {request.studentName ||
                              request.name ||
                              "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {request.email || "-"}
                          </p>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {request.program || "-"}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                          {request.programType || "-"}
                        </span>
                      </td>

                      {/* Matching */}
                      <td className="px-5 py-4">
                        <MatchingBadge request={request} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            request.requestStatus ||
                            request.certificateRequestStatus
                          }
                        />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          request.registrationDate ||
                            request.createdAt,
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleViewDetails(request)
                            }
                            disabled={detailsLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>

                          {(
                            request.requestStatus ||
                            request.certificateRequestStatus
                          ) === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleAction(
                                    request,
                                    "approve",
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `approve-${request.id}`
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {actionLoading ===
                                `approve-${request.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleAction(
                                    request,
                                    "reject",
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `reject-${request.id}`
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {actionLoading ===
                                `reject-${request.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
</div>
 )}

{/* Pagination */}
<div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
  {/* Showing count */}
  <p className="text-xs text-slate-400">
    showing {startItem}–{endItem} of {filteredRequests.length}
  </p>

  <div className="flex items-center gap-1">

    {/* Previous */}
    <button
      type="button"
      onClick={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      ‹
    </button>

    {/* Page 1 */}
    <button
      type="button"
      onClick={() => goToPage(1)}
      className={`h-8 w-8 rounded-lg text-xs font-medium ${
        currentPage === 1
          ? "bg-sky-600 text-white"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      1
    </button>

    {/* Left dots */}
    {currentPage > 3 && (
      <span className="px-1 text-xs text-slate-400">...</span>
    )}

    {/* Middle pages */}
    {Array.from(
      new Set(
        [
          currentPage - 1,
          currentPage,
          currentPage + 1,
        ].filter(
          (page) => page > 1 && page < totalPages
        )
      )
    ).map((page) => (
      <button
        key={page}
        type="button"
        onClick={() => goToPage(page)}
        className={`h-8 w-8 rounded-lg text-xs font-medium ${
          currentPage === page
            ? "bg-sky-600 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        {page}
      </button>
    ))}

    {/* Right dots */}
    {currentPage < totalPages - 2 && (
      <span className="px-1 text-xs text-slate-400">...</span>
    )}

    {/* Last Page */}
    {totalPages > 1 && (
      <button
        type="button"
        onClick={() => goToPage(totalPages)}
        className={`h-8 w-8 rounded-lg text-xs font-medium ${
          currentPage === totalPages
            ? "bg-sky-600 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        {totalPages}
      </button>
    )}

    {/* Next */}
    <button
      type="button"
      onClick={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      ›
    </button>

  </div>
</div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Certificate Request Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Registration ID: #{selectedRequest.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Student Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedRequest.studentName ||
                    selectedRequest.name ||
                    "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-slate-900">
                  {selectedRequest.email || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedRequest.phone || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  LMS Matching
                </p>

                <div className="mt-2">
                  <MatchingBadge
                    request={selectedRequest}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Program
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedRequest.program || "-"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Type:{" "}
                  {selectedRequest.programType || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Request Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      selectedRequest.requestStatus ||
                      selectedRequest.certificateRequestStatus
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Request Date
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(
                    selectedRequest.registrationDate ||
                      selectedRequest.createdAt,
                  )}
                </p>
              </div>

              {selectedRequest.certificate && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Certificate
                  </p>

                  <p className="mt-1 font-medium text-emerald-800">
                    Certificate Number:{" "}
                    {selectedRequest.certificate
                      .certificateNumber || "-"}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    Issued:{" "}
                    {formatDate(
                      selectedRequest.certificate
                        .issuedAt,
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              {(
                selectedRequest.requestStatus ||
                selectedRequest.certificateRequestStatus
              ) === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      handleAction(
                        selectedRequest,
                        "reject",
                      )
                    }
                    disabled={Boolean(actionLoading)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      handleAction(
                        selectedRequest,
                        "approve",
                      )
                    }
                    disabled={Boolean(actionLoading)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default AdminCertificateRequests;