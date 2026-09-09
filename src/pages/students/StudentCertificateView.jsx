import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Loader2,
  Printer,
  ShieldCheck,
  Share2,
} from "lucide-react";
import api from "../../api/axios";

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
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');
`;

const bodyFont = {
  fontFamily: "'Inter', sans-serif",
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

  const handleShareCertificate = async () => {
    const verificationUrl =
      getVerificationUrl();

    if (!verificationUrl) {
      return;
    }

    const courseName =
      certificate?.course?.title ||
      "Course Completion";

    const studentName =
      certificate?.student?.name ||
      "Student";

    const shareData = {
      title: `Certificate - ${courseName}`,
      text: `${studentName} successfully completed ${courseName} at QNAYDS LLP.`,
      url: verificationUrl,
    };

    try {
      if (
        navigator.share &&
        typeof navigator.share === "function"
      ) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(
        verificationUrl,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          verificationUrl,
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (clipboardError) {
        console.error(
          "Clipboard fallback failed:",
          clipboardError,
        );
      }
    }
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

          <p className="text-sm">
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

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // CERTIFICATE DATA
  // ========================================

  const verificationUrl =
    getVerificationUrl();

  const startDate =
    certificate.startDate ||
    certificate.course?.startDate;

  const endDate =
    certificate.endDate ||
    certificate.course?.endDate;

  // ========================================
  // MAIN UI
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
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
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
                  {certificate.student?.name ||
                    "[Student Name]"}
                </h3>
              </div>

              {/* COMPLETING COURSE */}

              <p
                className="mt-[2%] text-slate-600"
                style={{
                  fontSize:
                    "clamp(10px, 1.3vw, 21px)",
                }}
              >
                for successfully completing the course
              </p>

              {/* COURSE NAME */}

              <h4
                className="mt-[1%] font-bold"
                style={{
                  color: navy,
                  fontSize:
                    "clamp(12px, 1.8vw, 30px)",
                }}
              >
                {certificate.course?.title ||
                  "[Course Name]"}
              </h4>

              {/* COURSE DATES */}

              <p
                className="mx-auto mt-[1.5%] max-w-[62%] leading-relaxed text-slate-600"
                style={{
                  fontSize:
                    "clamp(9px, 1.2vw, 20px)",
                }}
              >
                conducted between{" "}
                {startDate
                  ? formatDate(startDate)
                  : "[Start Date]"}{" "}
                and{" "}
                {endDate
                  ? formatDate(endDate)
                  : "[End Date]"},
                demonstrating dedication,
                skill, and commitment throughout
                the program.
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

            <button
              onClick={handleShareCertificate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Certificate
                </>
              )}
            </button>
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
    </div>
  );
};

export default StudentCertificateView;