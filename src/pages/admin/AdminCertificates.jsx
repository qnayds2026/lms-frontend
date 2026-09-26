import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  Search,
  X,
  Eye,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Video,
  Calendar,
  CalendarDays,
  Hash,
  Mail,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
 
// ========================================
// FONT (matches the styling used across other admin pages)
// ========================================
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
`;
const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
 
const PAGE_SIZE = 10;
 
// ========================================
// CERTIFICATE TYPE META
// Course certificates come from completed courses; external program
// certificates (Webinar / Internship / Workshop) come from programs run
// outside a course. Adjust this map if the backend uses different enum
// values for `certificate.type`.
// ========================================
const TYPE_META = {
  COURSE: { label: "Course", icon: BookOpen, badge: "bg-sky-50 text-sky-700 border-sky-200" },
  WEBINAR: { label: "Webinar", icon: Video, badge: "bg-purple-50 text-purple-700 border-purple-200" },
  INTERNSHIP: { label: "Internship", icon: Briefcase, badge: "bg-amber-50 text-amber-700 border-amber-200" },
  WORKSHOP: { label: "Workshop", icon: GraduationCap, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};
const TYPE_ORDER = ["COURSE", "WEBINAR", "INTERNSHIP", "WORKSHOP"];
 
function getTypeMeta(type) {
  return TYPE_META[type] || { label: type || "Certificate", icon: Award, badge: "bg-slate-100 text-slate-600 border-slate-200" };
}
 
// ========================================
// DEFENSIVE FIELD GETTERS
// The exact response shape from GET /api/admin/certificates isn't fixed
// here, so these helpers check a few likely field names and fall back
// gracefully. Narrow these down once the real API contract is confirmed.
// ========================================
function getCertId(cert) {
  return cert?.id ?? cert?._id;
}
function getCertType(cert) {
  return (cert?.type || cert?.certificateType || cert?.category || "COURSE")
    .toString()
    .toUpperCase();
}
function isCourseCert(cert) {
  return getCertType(cert) === "COURSE";
}
function getProgramOrCourseName(cert) {
  return (
    cert?.course?.title ||
    cert?.course?.name ||
    cert?.programRegistration?.program?.title ||
    cert?.programRegistration?.program?.name ||
    cert?.title ||
    "—"
  );
}
function getStudentName(cert) {
  return cert?.student?.name || cert?.studentName || cert?.user?.name || "—";
}
function getStudentEmail(cert) {
  return cert?.student?.email || cert?.studentEmail || cert?.user?.email || "—";
}
function getCertNumber(cert) {
  return cert?.certificateNumber || cert?.certNumber || cert?.number || "—";
}
function getIssueDate(cert) {
  return cert?.issuedAt || cert?.issueDate || cert?.createdAt || null;
}
function getVerificationCode(cert) {
  return cert?.verificationCode || null;
}
 
function initialsOf(name) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S"
  );
}
 
function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
 
function toDateInputValue(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
 
// ========================================
// SMALL UI PIECES
// ========================================
function StatCard({ title, value, icon, color }) {
  const colors = {
    sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
  };
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60 transition">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${colors[color]} group-hover:text-white`}
      >
        {icon}
      </div>
      <p className="text-slate-500 mt-4 text-sm">{title}</p>
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1" style={display}>
        {value}
      </h2>
    </div>
  );
}
 
function TypeBadge({ type }) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}
 
function TableSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}
 
// ========================================
// CERTIFICATE DETAILS MODAL
// ========================================
function CertificateDetailsModal({
  open,
  loading,
  error,
  certificate,
  onClose,
  onRetry,
  onDownload,
  downloading,
}) {
  if (!open) return null;
 
  const type = certificate ? getCertType(certificate) : null;
  const verificationCode = certificate ? getVerificationCode(certificate) : null;
 
  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-lg font-semibold text-slate-900" style={display}>
              Certificate Details
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
 
          <div className="p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <p className="mt-3 text-sm">Loading certificate...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </span>
                <p className="mt-4 text-sm text-slate-600">{error}</p>
                <button
                  onClick={onRetry}
                  className="mt-4 text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  Try again
                </button>
              </div>
            ) : certificate ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <span
                    className="h-16 w-16 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg font-semibold"
                    style={display}
                  >
                    {initialsOf(getStudentName(certificate))}
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900">
                    {getStudentName(certificate)}
                  </h3>
                  <p className="text-xs text-slate-400">{getStudentEmail(certificate)}</p>
                  <div className="mt-3">
                    <TypeBadge type={type} />
                  </div>
                </div>
 
                <div className="mt-6 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700 truncate" style={mono}>
                      {getCertNumber(certificate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    {isCourseCert(certificate) ? (
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <p className="text-sm text-slate-700">{getProgramOrCourseName(certificate)}</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700">
                      Issued {formatDate(getIssueDate(certificate))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700 truncate">
                      {getStudentEmail(certificate)}
                    </p>
                  </div>
                  {verificationCode && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs text-slate-500 break-all" style={mono}>
                        {verificationCode}
                      </p>
                    </div>
                  )}
                </div>
 
                {verificationCode && (
                  <a
                    href={`/verify-certificate/${verificationCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    View public verification page
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
 
                <button
                  onClick={() => onDownload(certificate)}
                  disabled={downloading}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Certificate
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ========================================
// MAIN PAGE
// ========================================
const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
 
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailCert, setDetailCert] = useState(null);
  const [detailFallback, setDetailFallback] = useState(null);
 
  const [downloadingId, setDownloadingId] = useState(null);
 
  // --------------------------------------
  // FETCH LIST
  // GET /api/admin/certificates
  // --------------------------------------
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");
 
      const res = await api.get("/admin/certificates");
 
      const raw = res.data;
      const list =
        raw?.data?.certificates ||
        raw?.data?.items ||
        raw?.data ||
        raw?.certificates ||
        raw ||
        [];
 
      setCertificates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load certificates:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load certificates. Please try again.",
      );
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchCertificates();
  }, []);
 
  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, courseFilter, programFilter, dateFilter]);
 
  // Reset the dependent dropdown when switching type filter, so
  // Course/Program selections can't silently conflict with the type.
  useEffect(() => {
    if (typeFilter === "COURSE") setProgramFilter("ALL");
    if (typeFilter !== "ALL" && typeFilter !== "COURSE") setCourseFilter("ALL");
  }, [typeFilter]);
 
  // --------------------------------------
  // FILTER OPTIONS (derived from loaded data)
  // --------------------------------------
  const courseOptions = useMemo(() => {
    const set = new Set();
    certificates.filter(isCourseCert).forEach((c) => {
      const name = getProgramOrCourseName(c);
      if (name && name !== "—") set.add(name);
    });
    return Array.from(set).sort();
  }, [certificates]);
 
  const programOptions = useMemo(() => {
    const set = new Set();
    certificates.filter((c) => !isCourseCert(c)).forEach((c) => {
      const name = getProgramOrCourseName(c);
      if (name && name !== "—") set.add(name);
    });
    return Array.from(set).sort();
  }, [certificates]);
 
  const typeOptions = useMemo(() => {
    const present = new Set(certificates.map(getCertType));
    return TYPE_ORDER.filter((t) => present.has(t));
  }, [certificates]);
 
  // --------------------------------------
  // FILTERING + SEARCH
  // --------------------------------------
  const filtered = certificates.filter((cert) => {
    const type = getCertType(cert);
    if (typeFilter !== "ALL" && type !== typeFilter) return false;
 
    const name = getProgramOrCourseName(cert);
    if (courseFilter !== "ALL" && name !== courseFilter) return false;
    if (programFilter !== "ALL" && name !== programFilter) return false;
 
    if (dateFilter) {
      const issuedDateStr = toDateInputValue(getIssueDate(cert));
      if (issuedDateStr !== dateFilter) return false;
    }
 
    if (search) {
      const q = search.toLowerCase();
      const matches =
        getCertNumber(cert).toLowerCase().includes(q) ||
        getStudentName(cert).toLowerCase().includes(q) ||
        getStudentEmail(cert).toLowerCase().includes(q);
      if (!matches) return false;
    }
 
    return true;
  });
 
  const hasActiveFilters =
    !!search ||
    typeFilter !== "ALL" ||
    courseFilter !== "ALL" ||
    programFilter !== "ALL" ||
    !!dateFilter;
 
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setCourseFilter("ALL");
    setProgramFilter("ALL");
    setDateFilter("");
  };
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);
 
  // --------------------------------------
  // STATS
  // --------------------------------------
  const totalCount = certificates.length;
  const courseCount = certificates.filter(isCourseCert).length;
  const externalCount = totalCount - courseCount;
 
  // --------------------------------------
  // DETAILS MODAL
  // GET /api/admin/certificates/:id
  // --------------------------------------
  const openDetails = async (cert) => {
    const id = getCertId(cert);
    setDetailOpen(true);
    setDetailFallback(cert);
    setDetailCert(null);
    setDetailError("");
    setDetailLoading(true);
 
    try {
      const res = await api.get(`/admin/certificates/${id}`);
      const raw = res.data;
      const data = raw?.data || raw;
      setDetailCert(data || cert);
    } catch (err) {
      console.error("Failed to load certificate details:", err);
      setDetailError(
        err?.response?.data?.message ||
          "Failed to load certificate details. Please try again.",
      );
    } finally {
      setDetailLoading(false);
    }
  };
 
  const closeDetails = () => {
    setDetailOpen(false);
    setDetailCert(null);
    setDetailFallback(null);
    setDetailError("");
  };
 
  const retryDetails = () => {
    if (detailFallback) openDetails(detailFallback);
  };
 
  // --------------------------------------
  // DOWNLOAD
  // Uses the existing certificate download API. Adjust the path below if
  // the admin download route differs from this assumed convention.
  // --------------------------------------
 const handleDownload = (cert) => {
  const code = getVerificationCode(cert);

  if (!code) {
    alert("This certificate doesn't have a verification code yet.");
    return;
  }

  // There's no PDF-download API in this project — students save their
  // certificate via the browser's Print → Save as PDF on this same page.
  // Admins get the same option by opening the verification page.
  window.open(`/verify-certificate/${code}`, "_blank");
};
 
  return (
    <div className="p-4 sm:p-6">
      <style>{FONT_IMPORT}</style>
 
      {/* Header */}
      <div className="mb-8">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
          style={mono}
        >
          admin_panel
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900" style={display}>
          Certificate Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          View, search, and download certificates issued to students.
        </p>
      </div>
 
      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Certificates"
          value={totalCount}
          icon={<Award className="w-5 h-5" />}
          color="sky"
        />
        <StatCard
          title="Course Certificates"
          value={courseCount}
          icon={<BookOpen className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="External Program Certificates"
          value={externalCount}
          icon={<Briefcase className="w-5 h-5" />}
          color="amber"
        />
      </div>
 
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by certificate number, student name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            />
          </div>
 
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
          >
            <option value="ALL">All Types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {getTypeMeta(t).label}
              </option>
            ))}
          </select>
 
          {typeFilter !== "WEBINAR" && typeFilter !== "INTERNSHIP" && typeFilter !== "WORKSHOP" && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            >
              <option value="ALL">All Courses</option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
 
          {typeFilter !== "COURSE" && (
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            >
              <option value="ALL">All Programs</option>
              {programOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
 
          <div className="relative">
            <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            />
          </div>
 
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
 
      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-14 text-center">
            <XCircle className="w-9 h-9 mx-auto text-red-300" />
            <p className="mt-4 text-slate-600 text-sm">{error}</p>
            <button
              onClick={fetchCertificates}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <Award className="w-9 h-9 mx-auto text-slate-300" />
            <p className="mt-4 text-slate-500 text-sm">
              {certificates.length === 0
                ? "No certificates have been issued yet."
                : "No certificates match your search or filters."}
            </p>
            {hasActiveFilters && certificates.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Certificate #
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Student
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden md:table-cell">
                      Course / Program
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden lg:table-cell">
                      Issue Date
                    </th>
                    <th className="text-right px-5 py-3.5 font-medium text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
 
                <tbody>
                  {paginated.map((cert) => {
                    const id = getCertId(cert);
                    return (
                      <tr
                        key={id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                      >
                        <td className="px-5 py-3.5 text-slate-600" style={mono}>
                          {getCertNumber(cert)}
                        </td>
 
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
                              style={display}
                            >
                              {initialsOf(getStudentName(cert))}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {getStudentName(cert)}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {getStudentEmail(cert)}
                              </p>
                            </div>
                          </div>
                        </td>
 
                        <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell max-w-60 truncate">
                          {getProgramOrCourseName(cert)}
                        </td>
 
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <TypeBadge type={getCertType(cert)} />
                        </td>
 
                        <td className="px-5 py-3.5 text-slate-600 hidden lg:table-cell">
                          {formatDate(getIssueDate(cert))}
                        </td>
 
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDetails(cert)}
                              title="View details"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition shrink-0"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(cert)}
                              disabled={downloadingId === id}
                              title="Download certificate"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition shrink-0"
                            >
                              {downloadingId === id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-300 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition ${
                          p === page ? "bg-sky-600 text-white" : "text-slate-500 hover:bg-slate-50"
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
 
      <CertificateDetailsModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        certificate={detailCert}
        onClose={closeDetails}
        onRetry={retryDetails}
        onDownload={handleDownload}
        downloading={detailCert ? downloadingId === getCertId(detailCert) : false}
      />
    </div>
  );
};
 
export default AdminCertificates;
 
