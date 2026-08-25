import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../../api/axios";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              View and verify the certificates you earned by successfully
              completing your courses.
            </p>
          </div>

          {!loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />

              <span>
                {certificates.length}{" "}
                {certificates.length === 1
                  ? "certificate earned"
                  : "certificates earned"}
              </span>
            </div>
          )}
        </div>

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
                <div className="h-40 bg-slate-100" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-10 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
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
                No Certificates Yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Complete your enrolled courses to earn certificates. Your
                certificates will appear here automatically after successful
                course completion.
              </p>

              <Link
                to="/student/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Explore My Courses
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Certificate List */
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50"
              >
                {/* Certificate Preview */}
                <div className="relative h-44 overflow-hidden bg-linear-to-br from-sky-50 via-white to-slate-100">
                  {certificate.course?.thumbnail ? (
                    <img
                      src={certificate.course.thumbnail}
                      alt={certificate.course?.title || "Course"}
                      className="absolute inset-0 h-full w-full object-cover opacity-10"
                    />
                  ) : null}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
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
                    </div>
                  </div>

                  {/* Verified badge */}
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-emerald-600 shadow-sm backdrop-blur">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                        {certificate.course?.title || "Completed Course"}
                      </h2>

                      <p
                        className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-slate-400"
                        style={mono}
                      >
                        {certificate.certificateNumber}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <span>Issued {formatDate(certificate.issuedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5">
                    <Link
                      to={`/student/certificates/${certificate.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      View Certificate
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificates;
