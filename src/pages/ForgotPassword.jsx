import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail } from "lucide-react";
import axiosInstance from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0284c7]/10">
            <BookOpen className="h-6 w-6 text-[#0284c7]" strokeWidth={2} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Forgot password?
          </h1>
          <p className="mt-1 text-sm text-slate-500 text-center">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-4 text-center">
            <Mail className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-emerald-700">
              If an account with that email exists, a reset link has been
              sent. Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0369a1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link to="/login" className="text-[#0284c7] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}