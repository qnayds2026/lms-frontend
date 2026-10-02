import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  Share2,
  Clock,
  XCircle,
  AlertCircle,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import api from "../../api/axios";
import AchievementShare from "../../components/ProgressShare/AchievementShare";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const display = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const mono = {
  fontFamily: "'JetBrains Mono', monospace",
};

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedShareCert, setSelectedShareCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/certificates/my");

      setCertificates(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load certificates:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load your certificates. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCertificateStatus = (cert) => {
    if (cert.programRegistration) {
      return (
        cert.programRegistration.certificateRequestStatus || "PENDING"
      ).toUpperCase();
    }
    // Course certificates are always approved
    return "APPROVED";
  };

  const getCertificateType = (cert) => {
    if (cert.course) return "COURSE";
    if (cert.programRegistration?.program?.type) {
      return cert.programRegistration.program.type.toUpperCase();
    }
    if (cert.type) return cert.type.toUpperCase();
    return "PROGRAM";
  };

  const getCertificateTitle = (cert) => {
    return (
      cert.course?.title ||
      cert.programRegistration?.program?.title ||
      "Certificate"
    );
  };

  const approvedCertificates = certificates.filter(
    (c) => getCertificateStatus(c) === "APPROVED",
  );
  const pendingCertificates = certificates.filter(
    (c) => getCertificateStatus(c) === "PENDING",
  );
  const rejectedCertificates = certificates.filter(
    (c) => getCertificateStatus(c) === "REJECTED",
  );

  const filteredCertificates = certificates.filter((c) => {
    if (filterTab === "approved") return getCertificateStatus(c) === "APPROVED";
    if (filterTab === "pending") return getCertificateStatus(c) === "PENDING";
    if (filterTab === "rejected") return getCertificateStatus(c) === "REJECTED";
    if (filterTab === "courses") return !!c.course;
    if (filterTab === "programs") return !!c.programRegistration;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <style>{FONT_IMPORT}</style>

      {/* Header */}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
              style={mono}
            >
              <Award className="h-3.5 w-3.5" />
              certificates
            </span>

            <h1
              className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
              style={display}
            >
              My Certificates
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View, verify, and share the certificates earned through your courses
              and specialized training programs.
            </p>
          </div>

          {!loading && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  {approvedCertificates.length}{" "}
                  {approvedCertificates.length === 1
                    ? "certificate earned"
                    : "certificates earned"}
                </span>
              </div>

              {pendingCertificates.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  <span>
                    {pendingCertificates.length} waiting for approval
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {!loading && certificates.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setFilterTab("approved")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filterTab === "approved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Approved ({approvedCertificates.length})
            </button>
            {pendingCertificates.length > 0 && (
              <button
                onClick={() => setFilterTab("pending")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  filterTab === "pending"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Waiting for Approval ({pendingCertificates.length})
              </button>
            )}
            {rejectedCertificates.length > 0 && (
              <button
                onClick={() => setFilterTab("rejected")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  filterTab === "rejected"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Rejected ({rejectedCertificates.length})
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-44 bg-slate-100" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-10 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCertificates.length === 0 ? (
          /* Empty State */
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex min-h-105 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-50">
                <Award className="h-10 w-10 text-sky-600" />
              </div>

              <h2
                className="mt-6 text-xl font-semibold text-slate-900"
                style={display}
              >
                {filterTab === "all"
                  ? "No Certificates Yet"
                  : `No ${filterTab.charAt(0).toUpperCase() + filterTab.slice(1)} Certificates`}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {filterTab === "all"
                  ? "Complete your enrolled courses or attend registered workshops & webinars to earn certificates."
                  : `There are currently no certificates in the ${filterTab} category.`}
              </p>

              <Link
                to="/student/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Explore Courses & Programs
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Certificate List */
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCertificates.map((certificate) => {
              const status = getCertificateStatus(certificate);
              const isApproved = status === "APPROVED";
              const isPending = status === "PENDING";
              const isRejected = status === "REJECTED";
              const type = getCertificateType(certificate);
              const title = getCertificateTitle(certificate);

              return (
                <div
                  key={certificate.id}
                  className={`group overflow-hidden rounded-2xl border bg-white transition duration-200 hover:-translate-y-1 ${
                    isApproved
                      ? "border-slate-200 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50"
                      : isPending
                      ? "border-amber-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/50"
                      : "border-red-200 hover:border-red-300 hover:shadow-xl hover:shadow-red-100/50"
                  }`}
                >
                  {/* Certificate Preview Banner */}
                  <div
                    className={`relative h-44 overflow-hidden ${
                      isApproved
                        ? "bg-linear-to-br from-sky-50 via-white to-slate-100"
                        : isPending
                        ? "bg-linear-to-br from-amber-50 via-white to-amber-100/40"
                        : "bg-linear-to-br from-red-50 via-white to-red-100/40"
                    }`}
                  >
                    {certificate.course?.thumbnail ? (
                      <img
                        src={certificate.course.thumbnail}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover opacity-10"
                      />
                    ) : null}

                    {/* Program Type Badge (Top-Left) */}
                    <div className="absolute left-4 top-4 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-xs backdrop-blur">
                        <GraduationCap className="h-3 w-3 text-sky-600" />
                        {type}
                      </span>
                    </div>

                    {/* Status Badge (Top-Right) */}
                    <div className="absolute right-4 top-4 z-10">
                      {isApproved ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-emerald-600 shadow-sm backdrop-blur">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          Verified
                        </div>
                      ) : isPending ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/95 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm backdrop-blur">
                          <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                          Pending Approval
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/95 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm backdrop-blur">
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                          Rejected
                        </div>
                      )}
                    </div>

                    {/* Center Icon & Label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        {isApproved ? (
                          <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sky-200 bg-white shadow-sm">
                              <Award className="h-7 w-7 text-sky-600" />
                            </div>
                            <p
                              className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-sky-700"
                              style={mono}
                            >
                              Certificate
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              of Completion
                            </p>
                          </>
                        ) : isPending ? (
                          <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-amber-50 shadow-sm">
                              <Clock className="h-7 w-7 text-amber-600 animate-pulse" />
                            </div>
                            <p
                              className="mt-2.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-800"
                              style={mono}
                            >
                              Request Pending
                            </p>
                            <p className="mt-0.5 text-[11px] text-amber-600">
                              Waiting for Admin Approval
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50 shadow-sm">
                              <XCircle className="h-7 w-7 text-red-500" />
                            </div>
                            <p
                              className="mt-2.5 text-xs font-bold uppercase tracking-[0.16em] text-red-700"
                              style={mono}
                            >
                              Request Declined
                            </p>
                            <p className="mt-0.5 text-[11px] text-red-500">
                              Not Approved by Admin
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isApproved
                            ? "bg-sky-50 text-sky-600"
                            : isPending
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isApproved ? (
                          <Sparkles className="h-4 w-4" />
                        ) : isPending ? (
                          <Clock className="h-4 w-4 animate-pulse" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                          {title}
                        </h2>

                        {isApproved ? (
                          <p
                            className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-slate-400"
                            style={mono}
                          >
                            {certificate.certificateNumber || "Verified Credential"}
                          </p>
                        ) : isPending ? (
                          <p className="mt-1 text-xs font-medium text-amber-700 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Waiting for admin approval
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Request was rejected by admin
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span>
                          {isApproved
                            ? `Issued ${formatDate(certificate.issuedAt)}`
                            : isPending
                            ? `Requested ${formatDate(
                                certificate.programRegistration?.createdAt ||
                                  certificate.createdAt,
                              )}`
                            : `Updated ${formatDate(
                                certificate.programRegistration?.updatedAt ||
                                  certificate.updatedAt,
                              )}`}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-medium ${
                          isApproved
                            ? "text-emerald-600"
                            : isPending
                            ? "text-amber-700"
                            : "text-red-600"
                        }`}
                      >
                        {isApproved
                          ? "Ready"
                          : isPending
                          ? "In Review"
                          : "Declined"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5">
                      {isApproved ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/student/certificates/${certificate.id}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedShareCert(certificate)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-sm cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      ) : isPending ? (
                        <Link
                          to={`/student/certificates/${certificate.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-2.5 text-xs sm:text-sm font-semibold text-amber-800 transition"
                        >
                          <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                          <span>View Request Status</span>
                          <ExternalLink className="h-3.5 w-3.5 text-amber-600 ml-1" />
                        </Link>
                      ) : (
                        <Link
                          to={`/student/certificates/${certificate.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2.5 text-xs sm:text-sm font-semibold text-red-700 transition"
                        >
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                          <span>View Rejection Details</span>
                          <ExternalLink className="h-3.5 w-3.5 text-red-500 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificate Achievement Share Modal */}
        {selectedShareCert && (
          <AchievementShare
            isOpen={!!selectedShareCert}
            onClose={() => setSelectedShareCert(null)}
            course={
              selectedShareCert.course || {
                title:
                  selectedShareCert.programRegistration?.program?.title ||
                  "Program Certificate",
              }
            }
            certificate={selectedShareCert}
            data={{
              courseName:
                selectedShareCert.course?.title ||
                selectedShareCert.programRegistration?.program?.title,
              courseId:
                selectedShareCert.courseId ||
                selectedShareCert.programRegistration?.programId,
              studentName:
                selectedShareCert.programRegistration?.name ||
                selectedShareCert.student?.name,
              credentialId: selectedShareCert.certificateNumber,
              completedAt: formatDate(selectedShareCert.issuedAt),
              isCourseCompleted: true,
              level: 1,
              levelTitle: `${getCertificateType(selectedShareCert)} Certification`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudentCertificates;

