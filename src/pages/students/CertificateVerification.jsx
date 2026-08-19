import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";

const CertificateVerification = () => {
  const { verificationCode } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/certificates/verify/${verificationCode}`);

        const data = res.data?.data;

        setValid(data?.valid === true);
        setCertificate(data?.certificate || null);
      } catch (err) {
        console.error("Certificate verification failed:", err);

        setValid(false);

        setError(
          err?.response?.data?.message ||
            "This certificate could not be verified.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (verificationCode) {
      verifyCertificate();
    } else {
      setLoading(false);
      setError("Verification code is missing.");
    }
  }, [verificationCode]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Verifying Certificate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we verify the certificate.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // INVALID
  // ==========================

  if (!valid || !certificate) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              QNAYDS ACADEMY
            </p>

            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              Certificate Not Verified
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {error ||
                "The certificate verification code is invalid or the certificate could not be found."}
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left">
              <p className="text-xs font-medium text-red-600">
                Verification Code
              </p>

              <p className="mt-1 break-all text-xs text-red-500">
                {verificationCode || "Not provided"}
              </p>
            </div>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Back to QNAYDS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // VALID
  // ==========================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
            <Award className="h-8 w-8 text-sky-600" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
            QNAYDS ACADEMY
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Certificate Verification
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Verify the authenticity of a certificate issued by QNAYDS Academy.
          </p>
        </div>

        {/* Valid Card */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {/* Success Header */}

          <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-emerald-800">
                  Certificate Verified
                </h2>

                <p className="mt-0.5 text-sm text-emerald-700">
                  This certificate is valid and was issued by QNAYDS Academy.
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Content */}

          <div className="p-6 md:p-10">
            {/* Student */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Certificate Awarded To
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                {certificate.studentName}
              </h2>
            </div>

            {/* Course */}

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                  <Award className="h-5 w-5 text-sky-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Course Completed
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">
                    {certificate.courseName}
                  </h3>
                </div>
              </div>
            </div>

            {/* Details */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Issue Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(certificate.issuedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Certificate Number
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Code */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verification Code
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-600">
                {verificationCode}
              </p>
            </div>

            {/* Footer */}

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Digitally verified by QNAYDS Academy
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
              >
                Visit QNAYDS
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom note */}

        <p className="mt-6 text-center text-xs text-slate-400">
          If you believe this certificate has been issued incorrectly, please
          contact QNAYDS Academy.
        </p>
      </div>
    </div>
  );
};

export default CertificateVerification;
