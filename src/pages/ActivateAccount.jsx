import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Terminal, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const mono = {
  fontFamily: "'JetBrains Mono', monospace",
};

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return alert("Invalid activation link.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      setLoading(true);

      await api.post("/auth/activate-account", {
        token,
        password,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Activation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <style>{FONT_IMPORT}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.07),transparent_55%)]" />

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>

          <span
            className="font-semibold text-slate-900 text-lg"
            style={display}
          >
            QNAYDS
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            $ activate --account
          </span>

          <h1
            className="mt-4 text-3xl font-semibold text-slate-900"
            style={display}
          >
            Activate your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your password to access your QNAYDS LMS account.
          </p>

          {success ? (
            <div className="mt-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />

              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                Account Activated 🎉
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your account has been activated successfully.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputBase}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputBase}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-60"
              >
                {loading ? "Activating..." : "Activate Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
