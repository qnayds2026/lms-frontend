import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  Printer,
  ShieldCheck,
  Share2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import api from "../../api/axios";
import AchievementShare from "../../components/ProgressShare/AchievementShare";

// ========================================
// LOGOS
// ========================================

import QNAYDS_LOGO from "../../assets/logo/QNAYDS_LOGO.png";
import AICTE_LOGO from "../../assets/logo/AICTE_LOGO.png";
import MSME_LOGO from "../../assets/logo/MSME_LOGO.png";

// ========================================
// FONT
// ========================================

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const bodyFont = {
  fontFamily: "'Inter', sans-serif",
};

const display = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const mono = {
  fontFamily: "'JetBrains Mono', monospace",
};

// ========================================
// BRAND COLORS
// ========================================

const navy = "#172a46";
const gold = "#c49a45";
const certificateBackground = "#f7f7f5";

// ========================================
// SIGNATORY
// ========================================

const SIGNATORY = {
  name: "",
  designation: "Name / Designation, Qnayds LLP",
};

// ========================================
// CORNER BLOCK
// ========================================

function CornerBlock({ position }) {
  const positions = {
    "top-left": "left-8 top-8 sm:left-10 sm:top-10 md:left-12 md:top-12",
    "top-right": "right-8 top-8 sm:right-10 sm:top-10 md:right-12 md:top-12",
    "bottom-left": "bottom-8 left-8 sm:bottom-10 sm:left-10 md:bottom-12 md:left-12",
    "bottom-right": "bottom-8 right-8 sm:right-10 sm:bottom-10 md:right-12 md:bottom-12",
  };

  return (
    <div
      className={`pointer-events-none absolute z-20 h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 ${positions[position]}`}
      style={{
        backgroundColor: gold,
      }}
    />
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

const StudentCertificateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // ========================================
  // FETCH CERTIFICATE
  // ========================================

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/certificates/${id}`);

        setCertificate(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load certificate:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load certificate.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  // ========================================
  // AFTER PRINT
  // ========================================

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove(
        "certificate-printing",
      );
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint,
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint,
      );

      document.body.classList.remove(
        "certificate-printing",
      );
    };
  }, []);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "[DD/MM/YYYY]";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };

  // ========================================
  // VERIFICATION URL
  // ========================================

  const getVerificationUrl = () => {
    if (!certificate?.verificationCode) {
      return "";
    }

    return `${window.location.origin}/verify-certificate/${certificate.verificationCode}`;
  };

  // ========================================
  // SHARE CERTIFICATE
  // ========================================

  const handleShareCertificate = () => {
    setShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const url = getVerificationUrl();
    if (!url) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ========================================
  // PRINT
  // ========================================

  const handlePrint = () => {
    document.body.classList.add(
      "certificate-printing",
    );

    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        style={bodyFont}
      >
        <style>{FONT_IMPORT}</style>

        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-sky-600" />

          <p className="text-sm font-medium">
            Loading certificate...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !certificate) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
        style={bodyFont}
      >
        <style>{FONT_IMPORT}</style>

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Award className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900" style={display}>
            Certificate Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "This certificate could not be found."}
          </p>

          <button
            onClick={() =>
              navigate("/student/certificates")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // CERTIFICATE DATA RESOLUTION
  // ========================================

  const isProgram = !!certificate.programRegistration;
  const status = isProgram
    ? (
        certificate.programRegistration?.certificateRequestStatus ||
        "PENDING"
      ).toUpperCase()
    : "APPROVED";

  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  const certType =
    certificate.type ||
    certificate.programRegistration?.program?.type ||
    (certificate.course ? "COURSE" : "PROGRAM");

  const studentName =
    certificate.programRegistration?.name ||
    certificate.student?.name ||
    "[Student Name]";

  const studentEmail =
    certificate.programRegistration?.email ||
    certificate.student?.email ||
    "";

  const programTitle =
    certificate.course?.title ||
    certificate.programRegistration?.program?.title ||
    "[Course / Program Name]";

  const startDate =
    certificate.startDate ||
    certificate.course?.startDate ||
    certificate.programRegistration?.program?.startDate;

  const endDate =
    certificate.endDate ||
    certificate.course?.endDate ||
    certificate.programRegistration?.program?.endDate;

  const verificationUrl = getVerificationUrl();

  const getCompletionPhrase = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "WORKSHOP") return "workshop";
    if (t === "WEBINAR") return "webinar";
    if (t === "INTERNSHIP") return "internship";
    return "course";
  };


  // ========================================
  // PENDING APPROVAL VIEW
  // ========================================

  if (isPending) {
    return (
      <div
        className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12"
        style={bodyFont}
      >
        <style>{FONT_IMPORT}</style>

        {/* Back navigation & header */}
        <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-4">
          <Link
            to="/student/certificates"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            My Certificates
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            Waiting for Admin Approval
          </span>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          {/* Header Banner */}
          <div className="border-b border-amber-100 bg-linear-to-br from-amber-50 via-white to-orange-50/40 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/80 shadow-inner">
              <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
            </div>

            <h1
              className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              style={display}
            >
              Waiting for Admin Approval
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              Your certificate request for{" "}
              <span className="font-semibold text-slate-900">
                {programTitle}
              </span>{" "}
              is currently under review by our administrative team. Once
              approved, your official verified certificate will be available to
              view, download, and share.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3.5 py-1 text-xs font-medium text-amber-800 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              Under Administrative Review
            </div>
          </div>

          {/* Details Body */}
          <div className="space-y-6 p-6 sm:p-8">
            <h3
              className="text-xs font-semibold uppercase tracking-wider text-slate-400"
              style={mono}
            >
              Request Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Program</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {programTitle}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  <GraduationCap className="h-3 w-3 text-sky-600" />
                  {certType}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Student Name</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {studentName}
                </p>
                {studentEmail && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {studentEmail}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Submission Date</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(
                    certificate.programRegistration?.createdAt ||
                      certificate.createdAt,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Current Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    <Clock className="h-3 w-3 animate-pulse" />
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-xs leading-5 text-amber-900">
              <span className="font-semibold text-amber-950">Notice:</span> Certificate
              requests for external programs (such as workshops, webinars, and
              internships) require administrator verification against attendance
              and participation records. You will receive access as soon as it
              is approved.
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/student/certificates"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Certificates
              </Link>

              <a
                href="mailto:support@qnayds.in"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Need Help? Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // REJECTED VIEW
  // ========================================

  if (isRejected) {
    return (
      <div
        className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12"
        style={bodyFont}
      >
        <style>{FONT_IMPORT}</style>

        {/* Back navigation & header */}
        <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-4">
          <Link
            to="/student/certificates"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            My Certificates
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-xs">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            Request Rejected
          </span>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
          {/* Header Banner */}
          <div className="border-b border-red-100 bg-linear-to-br from-red-50 via-white to-rose-50/40 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-red-200 bg-red-50/80 shadow-inner">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>

            <h1
              className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              style={display}
            >
              Certificate Request Rejected
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              Your certificate request for{" "}
              <span className="font-semibold text-slate-900">
                {programTitle}
              </span>{" "}
              was reviewed and not approved by the administrator.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/90 px-3.5 py-1 text-xs font-medium text-red-700 shadow-xs">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              Request Declined by Administrator
            </div>
          </div>

          {/* Details Body */}
          <div className="space-y-6 p-6 sm:p-8">
            <h3
              className="text-xs font-semibold uppercase tracking-wider text-slate-400"
              style={mono}
            >
              Request Summary
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Program</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {programTitle}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  <GraduationCap className="h-3 w-3 text-sky-600" />
                  {certType}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Applicant</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {studentName}
                </p>
                {studentEmail && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {studentEmail}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Last Updated</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(
                    certificate.programRegistration?.updatedAt ||
                      certificate.updatedAt,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-400">Decision Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </span>
                </div>
              </div>
            </div>

            {/* Guidance note */}
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 text-xs leading-5 text-red-800">
              <span className="font-semibold text-red-950">Next Steps:</span> Certificate
              requests may be rejected if attendance requirements were not met,
              assessments were incomplete, or verification failed. If you
              completed all requirements and believe this was in error, please
              contact the program coordinator or support team with your attendance details.
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/student/certificates"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Certificates
              </Link>

              <a
                href="mailto:support@qnayds.in"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Contact Support for Review
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // APPROVED / COURSE CERTIFICATE MAIN UI
  // ========================================

  return (
    <div
      className="certificate-page min-h-screen bg-slate-100 px-3 py-5 md:px-8 md:py-10"
      style={bodyFont}
    >
      <style>{`
        ${FONT_IMPORT}

        /* ========================================
           PRINT SETTINGS
        ======================================== */

        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
          }

          body.certificate-printing * {
            visibility: hidden !important;
          }

          body.certificate-printing .certificate-page,
          body.certificate-printing .certificate-page * {
            visibility: visible !important;
          }

          body.certificate-printing .certificate-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;

            width: 297mm !important;
            height: 210mm !important;

            min-height: 210mm !important;

            margin: 0 !important;
            padding: 0 !important;

            background: white !important;
          }

          body.certificate-printing .certificate-wrapper {
            width: 297mm !important;
            height: 210mm !important;

            max-width: none !important;

            margin: 0 !important;
            padding: 0 !important;
          }

          body.certificate-printing .certificate {
            width: 297mm !important;
            height: 210mm !important;

            margin: 0 !important;

            box-shadow: none !important;

            border-radius: 0 !important;
          }

          body.certificate-printing .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ========================================
          SCREEN HEADER
      ======================================== */}

      <div className="no-print mx-auto mb-6 flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/student/certificates"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />

          My Certificates
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 cursor-pointer"
        >
          <Printer className="h-4 w-4" />

          Print / Save PDF
        </button>
      </div>

      {/* ========================================
          CERTIFICATE WRAPPER
      ======================================== */}

      <div className="certificate-wrapper mx-auto w-full max-w-[1400px]">
        <div
          className="certificate relative overflow-hidden shadow-2xl"
          style={{
            aspectRatio: "297 / 210",
            background: certificateBackground,
          }}
        >
          {/* ========================================
              OUTER NAVY BORDER
          ======================================== */}

          <div
             className="absolute inset-8 border-[3px] sm:inset-10 md:inset-12"
            style={{
              borderColor: navy,
            }}
          />

          {/* ========================================
              INNER GOLD BORDER
          ======================================== */}

          <div
            className="pointer-events-none absolute inset-12 border sm:inset-14 md:inset-16"
            style={{
              borderColor: gold,
            }}
          />   
          {/* GOLD CORNERS */}

          <CornerBlock position="top-left" />
          <CornerBlock position="top-right" />
          <CornerBlock position="bottom-left" />
          <CornerBlock position="bottom-right" />

          {/* ========================================
              CERTIFICATE CONTENT
          ======================================== */}

          <div className="relative z-10 flex h-full flex-col px-[7%] py-[5%]">

            {/* ========================================
                TOP HEADER
            ======================================== */}

            <div className="grid grid-cols-3 items-start">

              {/* LEFT LOGOS */}

              <div className="flex flex-col items-start gap-2 pt-10">

                {/* MSME */}

                <img
                  src={MSME_LOGO}
                  alt="MSME"
                  className="h-[56px] w-auto object-contain sm:h-[68px] md:h-[96px]"
                />

                {/* AICTE UNDER MSME */}

                <img
                  src={AICTE_LOGO}
                  alt="AICTE"
                  className="ml-2 h-[52px] w-auto object-contain sm:h-[64px] md:h-[88px]"
                />
              </div>

              {/* CENTER BRAND */}

              <div className="pt-18 text-center">

                <h1
                  className="text-lg font-extrabold tracking-[0.08em] sm:text-2xl md:text-4xl"
                  style={{
                    color: navy,
                  }}
                >
                  QNAYDS LLP
                </h1>

                <p className="mt-1 text-[7px] font-bold tracking-wide text-slate-500 sm:text-[10px] md:text-sm">
                  CYBERSECURITY TRAINING INSTITUTE
                </p>

                <div
                  className="mx-auto mt-2 h-px w-20 sm:w-32 md:w-48"
                  style={{
                    backgroundColor: gold,
                  }}
                />
              </div>

              {/* RIGHT QNAYDS LOGO */}

              <div className="flex justify-end pt-10">

                <img
                  src={QNAYDS_LOGO}
                  alt="QNAYDS"
                  className="h-[70px] w-auto object-contain sm:h-[90px] md:h-[135px]"
                />
              </div>
            </div>

            {/* ========================================
                TITLE
            ======================================== */}

            <div className="relative -top-7 mt-[1%] text-center">

              <h2
                className="font-extrabold tracking-wide"
                style={{
                  color: navy,
                  fontSize: "clamp(20px, 3.6vw, 62px)",
                }}
              >
                CERTIFICATE OF COMPLETION
              </h2>
            </div>

            {/* ========================================
                MAIN CERTIFICATE CONTENT
            ======================================== */}

            <div className="relative -top-7 flex flex-1 flex-col items-center justify-start pt-[1%] text-center">

              {/* PRESENTED TO */}

              <p
                className="italic text-slate-600"
                style={{
                  fontSize:
                    "clamp(10px, 1.4vw, 23px)",
                }}
              >
                This certificate is proudly presented to
              </p>

              {/* STUDENT NAME */}

              <div
                className="mt-[2%] border-b px-5 pb-1"
                style={{
                  borderColor: gold,
                  minWidth: "38%",
                }}
              >
                <h3
                  className="font-bold"
                  style={{
                    color: navy,
                    fontSize:
                      "clamp(18px, 3vw, 52px)",
                  }}
                >
                  {studentName}
                </h3>
              </div>

              {/* COMPLETING COURSE / PROGRAM */}

              <p
                className="mt-[2%] text-slate-600"
                style={{
                  fontSize:
                    "clamp(10px, 1.3vw, 21px)",
                }}
              >
                for successfully completing the {getCompletionPhrase(certType)}
              </p>

              {/* COURSE / PROGRAM NAME */}

              <h4
                className="mt-[1%] font-bold"
                style={{
                  color: navy,
                  fontSize:
                    "clamp(12px, 1.8vw, 30px)",
                }}
              >
                {programTitle}
              </h4>

              {/* COURSE DATES */}

              <p
                className="mx-auto mt-[1.5%] max-w-[62%] leading-relaxed text-slate-600"
                style={{
                  fontSize:
                    "clamp(9px, 1.2vw, 20px)",
                }}
              >
                {startDate && endDate && formatDate(startDate) !== formatDate(endDate) ? (
                  <>
                    conducted between {formatDate(startDate)} and{" "}
                    {formatDate(endDate)}, demonstrating dedication, skill, and
                    commitment throughout the program.
                  </>
                ) : startDate ? (
                  <>
                    conducted on {formatDate(startDate)}, demonstrating
                    dedication, skill, and commitment throughout the program.
                  </>
                ) : (
                  <>
                    conducted between [Start Date] and [End Date],
                    demonstrating dedication, skill, and commitment throughout
                    the program.
                  </>
                )}
              </p>
            </div>

            {/* ========================================
                BOTTOM SECTION
            ======================================== */}

            <div className="grid grid-cols-3 items-end pb-[1%]">

              {/* DATE OF ISSUE */}

              <div className="relative translate-x-30 -translate-y-10 text-left">

                <div
                  className="h-px w-[clamp(100px,12vw,180px)]"
                  style={{
                    backgroundColor: "#64748b",
                  }}
                />

                <p
                  className="mt-1 text-slate-600"
                  style={{
                    fontSize:
                      "clamp(9px, 1.05vw, 18px)",
                  }}
                >
                  Date of Issue:{" "}
                  {formatDate(
                    certificate.issuedAt,
                  )}
                </p>
              </div>

              {/* CERTIFICATE ID */}

              <div className="text-center">

                <p
                  className="text-slate-500"
                  style={{
                    fontSize:
                      "clamp(8px, 0.95vw, 16px)",
                  }}
                >
                  Certificate ID:{" "}
                  {certificate.certificateNumber ||
                    "[QN-XXXX-XXXX]"}
                </p>
              </div>

              {/* SIGNATORY */}

              <div className="relative -translate-x-30 -translate-y-7 text-right">

                <div
                  className="ml-auto h-px w-[clamp(100px,12vw,180px)]"
                  style={{
                    backgroundColor: "#64748b",
                  }}
                />

                <p
                  className="mt-1 font-medium text-slate-600"
                  style={{
                    fontSize:
                      "clamp(9px, 1.05vw, 18px)",
                  }}
                >
                  Authorized Signatory
                </p>

                <p
                  className="italic text-slate-500"
                  style={{
                    fontSize:
                      "clamp(8px, 0.85vw, 15px)",
                  }}
                >
                  {SIGNATORY.name
                    ? `${SIGNATORY.name}, Qnayds LLP`
                    : SIGNATORY.designation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          VERIFICATION CARD
      ======================================== */}

      <div className="no-print mx-auto mt-6 max-w-[1400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Certificate Verification
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Anyone can verify the authenticity
                  of this certificate using the
                  verification link.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareCertificate}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Share Certificate
              </button>
            </div>
          </div>

          {verificationUrl && (
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="break-all text-xs text-slate-500">
                {verificationUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          STATUS
      ======================================== */}

      <div className="no-print mx-auto mt-4 flex max-w-6xl items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

        Digitally verifiable certificate
      </div>

      {/* Achievement Share Modal */}
      {shareModalOpen && certificate && (
        <AchievementShare
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          course={certificate.course || { title: programTitle }}
          certificate={certificate}
          data={{
            courseName: programTitle,
            courseId:
              certificate.courseId ||
              certificate.programRegistration?.programId,
            studentName: studentName,
            credentialId: certificate.certificateNumber,
            completedAt: formatDate(certificate.issuedAt),
            isCourseCompleted: true,
            level: 1,
            levelTitle: `${certType} Official Certification`,
          }}
        />
      )}
    </div>
  );
};

export default StudentCertificateView;