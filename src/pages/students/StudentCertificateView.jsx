import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Copy,
  Loader2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Tangerine:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const certificateFont = { fontFamily: "'Cormorant Garamond', serif" };
const scriptFont = { fontFamily: "'Tangerine', cursive" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

// Gold palette used throughout the certificate
const gold = {
  text: "#a3791f",
  line: "#c9a24b",
  soft: "#f6ecd2",
};

// Update these two names to whoever should actually be signing certificates.
const SIGNATORIES = {
  director: "Saavad",
  directorTitle: "Course Director",
  mentor: "Alan Joly",
  mentorTitle: "Mentor",
};

// A small repeating diamond-chain motif for the top/bottom ornamental
// border strips — an original geometric pattern, not a reproduction of
// any existing artwork.
function DiamondBorderStrip({ flip = false }) {
  const count = 46;
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 h-4 sm:h-5 flex items-center justify-center gap-[3px] overflow-hidden ${
        flip ? "bottom-0" : "top-0"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rotate-45"
          style={{
            background:
              i % 2 === 0
                ? "linear-gradient(135deg, #d4b25a, #a3791f)"
                : "linear-gradient(135deg, #e9d296, #c9a24b)",
          }}
        />
      ))}
    </div>
  );
}

// Small L-shaped corner brackets, echoing the accents on formal certificates
function CornerBracket({ position }) {
  const base = "absolute h-6 w-6 sm:h-8 sm:w-8";
  const pos = {
    "top-left": "top-3 left-3 sm:top-4 sm:left-4 border-t-2 border-l-2",
    "top-right": "top-3 right-3 sm:top-4 sm:right-4 border-t-2 border-r-2",
    "bottom-left":
      "bottom-3 left-3 sm:bottom-4 sm:left-4 border-b-2 border-l-2",
    "bottom-right":
      "bottom-3 right-3 sm:bottom-4 sm:right-4 border-b-2 border-r-2",
  };
  return (
    <div
      className={`${base} ${pos[position]} pointer-events-none`}
      style={{ borderColor: gold.line }}
    />
  );
}

// Decorative gold seal + ribbon, matching the medallion look on formal
// completion certificates. Sized generously so the ribbon tails are always
// fully contained — they must never bleed into the footer row below.
// Center now shows a scannable QR code linking to the verification page
// instead of a plain icon, with the institution name curved around the ring.
function SealRibbon({ verificationUrl }) {
  const qrSrc = verificationUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(
        verificationUrl,
      )}`
    : null;

  return (
    <div className="pointer-events-none relative mx-auto h-24 w-16 sm:h-28 sm:w-20">
      {/* Ribbon tails */}
      <div
        className="absolute left-1/2 top-8 h-14 w-6 -translate-x-[13px] -rotate-[18deg] sm:h-16"
        style={{ background: "linear-gradient(180deg,#cbd5e1,#94a3b8)" }}
      />
      <div
        className="absolute left-1/2 top-8 h-14 w-6 translate-x-[7px] rotate-[18deg] sm:h-16"
        style={{ background: "linear-gradient(180deg,#e2e8f0,#cbd5e1)" }}
      />
      {/* Medallion */}
      <div
        className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full sm:h-20 sm:w-20"
        style={{
          background: "linear-gradient(135deg,#e9d296,#a3791f)",
          boxShadow: "0 3px 10px rgba(163,121,31,0.35)",
        }}
      >
        <div
          className="absolute inset-[6px] rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.6)" }}
        />

        {/* Curved institution name around the ring */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <path
              id="sealRingPath"
              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text
            fill="rgba(255,255,255,0.85)"
            fontSize="7.5"
            letterSpacing="2"
            style={monoFont}
          >
            <textPath href="#sealRingPath" startOffset="2%">
              QNAYDS ACADEMY • VERIFIED •
            </textPath>
          </text>
        </svg>

        {/* Center: QR code linking to the verification page, falls back to
            a plain award mark if no verification URL is available */}
        <div className="absolute inset-0 flex items-center justify-center">
          {qrSrc ? (
            <img
              src={qrSrc}
              alt="Scan to verify"
              className="h-8 w-8 rounded-[3px] bg-white p-0.5 sm:h-10 sm:w-10"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "block";
              }}
            />
          ) : null}
          <Award
            className="h-6 w-6 text-white/90 sm:h-7 sm:w-7"
            style={{ display: qrSrc ? "none" : "block" }}
          />
        </div>
      </div>
    </div>
  );
}

const StudentCertificateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/certificates/${id}`);

        setCertificate(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load certificate:", err);

        setError(err?.response?.data?.message || "Failed to load certificate.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove("certificate-printing");
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      document.body.classList.remove("certificate-printing");
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getVerificationUrl = () => {
    if (!certificate?.verificationCode) return "";
    return `${window.location.origin}/verify-certificate/${certificate.verificationCode}`;
  };

  const handleCopyVerification = async () => {
    const url = getVerificationUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy verification link:", err);
    }
  };

  const handlePrint = () => {
    document.body.classList.add("certificate-printing");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        style={bodyFont}
      >
        <style>{FONT_IMPORT}</style>
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
          <p className="text-sm">Loading certificate...</p>
        </div>
      </div>
    );
  }

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
            {error || "This certificate could not be found."}
          </p>
          <button
            onClick={() => navigate("/student/certificates")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  const verificationUrl = getVerificationUrl();

  return (
    <div
      className="certificate-page min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10"
      style={bodyFont}
    >
      <style>{`
        ${FONT_IMPORT}

        @media print {
          @page { size: A4 landscape; margin: 0; }

          html, body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          body.certificate-printing * { visibility: hidden !important; }

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
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
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
            min-height: 0 !important;
            max-height: 210mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          body.certificate-printing .no-print { display: none !important; }
        }
      `}</style>

      {/* SCREEN HEADER */}
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

      {/* CERTIFICATE */}
      <div className="certificate-wrapper mx-auto w-full max-w-6xl">
        <div
          className="certificate relative overflow-hidden rounded-2xl shadow-2xl shadow-slate-300/40"
          style={{ background: "#faf8f2" }}
        >
          <DiamondBorderStrip />
          <DiamondBorderStrip flip />

          {/* Border frame */}
          <div
            className="pointer-events-none absolute inset-3 rounded-xl border"
            style={{ borderColor: gold.line }}
          />
          <div className="pointer-events-none absolute inset-5 rounded-lg border border-slate-200" />

          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          {/* Soft decorative circles */}
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full"
            style={{ background: gold.soft, opacity: 0.5 }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full"
            style={{ background: gold.soft, opacity: 0.5 }}
          />

          <div className="relative flex h-full min-h-0 flex-col justify-between px-8 py-10 sm:px-14 md:px-20 md:py-12">
            {/* TOP ROW: accreditation badges + QNAYDS mark */}
            <div className="flex items-start justify-between gap-4">
              {/* Accreditation badges — drop your existing, verified badge
                  files at these paths. Hidden automatically if not present. */}
              <div className="flex items-center gap-3">
                <img
                  src="/badges/msme.png"
                  alt="MSME"
                  className="h-12 w-auto sm:h-14"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <img
                  src="/badges/aicte.png"
                  alt="AICTE"
                  className="h-12 w-auto sm:h-14"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              <img
                src="/qnayds-logo.png"
                alt="QNAYDS"
                className="h-12 w-auto sm:h-14"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            {/* HEADER */}
            <div className="text-center">
              <h1
                className="text-5xl italic text-slate-900 sm:text-6xl md:text-7xl"
                style={{ ...certificateFont, color: "#232323" }}
              >
                Certificate
              </h1>
              <p
                className="-mt-3 text-3xl sm:-mt-4 sm:text-4xl md:text-5xl"
                style={{ ...scriptFont, color: gold.text }}
              >
                of Completion
              </p>

              <div
                className="mx-auto mt-3 h-px w-24"
                style={{ background: gold.line }}
              />

              <p
                className="mt-4 text-xs font-medium tracking-[0.35em] text-slate-500"
                style={bodyFont}
              >
                PROUDLY PRESENTED TO
              </p>
            </div>

            {/* STUDENT */}
            <div className="py-4 text-center">
              <h2
                className="text-4xl font-semibold text-slate-900 sm:text-5xl md:text-6xl"
                style={certificateFont}
              >
                {certificate.student?.name || "Student Name"}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                has successfully completed the course
              </p>

              <h3
                className="mt-1 text-2xl font-semibold sm:text-3xl md:text-4xl"
                style={{ ...certificateFont, color: gold.text }}
              >
                {certificate.course?.title || "Course Name"}
              </h3>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                {certificate.description ||
                  "This achievement demonstrates the successful completion of all required learning activities for this course, awarded on behalf of QNAYDS Academy."}
              </p>
            </div>

            {/* SEAL */}
            <SealRibbon verificationUrl={verificationUrl} />

            {/* FOOTER */}
            <div className="mt-4 grid grid-cols-3 items-end gap-3 sm:gap-8">
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-slate-500 sm:gap-2">
                  <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[10px] uppercase tracking-wider sm:text-xs">
                    Issue Date
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-800 sm:text-sm">
                  {formatDate(certificate.issuedAt)}
                </p>
              </div>

              <div className="text-center">
                <p
                  className="text-xl sm:text-3xl"
                  style={{ ...scriptFont, color: "#1e293b" }}
                >
                  {SIGNATORIES.director}
                </p>
                <div
                  className="mx-auto mt-1 h-px w-20 sm:w-32"
                  style={{ background: gold.line }}
                />
                <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:text-[11px]">
                  {SIGNATORIES.directorTitle}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-xl sm:text-3xl"
                  style={{ ...scriptFont, color: "#1e293b" }}
                >
                  {SIGNATORIES.mentor}
                </p>
                <div
                  className="ml-auto mr-0 mt-1 h-px w-20 sm:w-32"
                  style={{ background: gold.line }}
                />
                <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:text-[11px]">
                  {SIGNATORIES.mentorTitle}
                </p>
              </div>
            </div>

            {/* BOTTOM ROW: cert number + startup badge */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <img
                src="/badges/startup-india.png"
                alt="Startup India"
                className="h-6 w-auto sm:h-7"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <p
                className="break-all text-right text-[11px] font-medium text-slate-400"
                style={monoFont}
              >
                {certificate.certificateNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION CARD */}
      <div className="no-print mx-auto mt-6 max-w-6xl">
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
                  Anyone can verify the authenticity of this certificate using
                  the verification link.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyVerification}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Verification Link
                </>
              )}
            </button>
          </div>

          {verificationUrl && (
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="break-all text-xs text-slate-500" style={monoFont}>
                {verificationUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* STATUS */}
      <div className="no-print mx-auto mt-4 flex max-w-6xl items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Digitally verifiable certificate
      </div>
    </div>
  );
};

export default StudentCertificateView;
