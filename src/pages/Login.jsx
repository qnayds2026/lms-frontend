import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import axiosInstance from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", formData);

      // Backend response shape: { success, message, data: { token, user } }
      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      if (!token) {
        throw new Error("No token returned from server");
      }

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Redirect based on role, matching Register.jsx's behavior
      if (user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user?.role === "INSTRUCTOR") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid email or password. Please try again."
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
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to continue to Qnayds</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#0284c7] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0369a1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#0284c7] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}