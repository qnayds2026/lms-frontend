import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserCog, Terminal, ChevronRight, Plus, X, Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-36 animate-pulse" />
  );
}

function CreateInstructorModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Reuses the public register endpoint — it accepts a role field and
      // doesn't require the caller to be authenticated, so this works fine
      // called from an already-logged-in admin session too.
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "INSTRUCTOR",
      });
      onCreated(res.data.data.user);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create instructor account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900" style={display}>
          Add Instructor
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Creates a new account with instructor access.
        </p>
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <input
            name="phone"
            placeholder="Phone number (optional)"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Temporary password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium text-sm transition"
          >
            {saving ? "Creating..." : "Create Instructor"}
          </button>
          <p className="text-xs text-slate-400 text-center pt-1">
            Share the email and password with them directly — there's no
            automatic email invite yet.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchInstructors() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/instructors");
        setInstructors(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load instructors.");
      } finally {
        setLoading(false);
      }
    }
    fetchInstructors();
  }, []);

  const filtered = instructors.filter(
    (i) =>
      i.name?.toLowerCase().includes(query.toLowerCase()) ||
      i.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <style>{FONT_IMPORT}</style>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
            style={mono}
          >
            <Terminal className="w-3.5 h-3.5" /> instructors
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={display}>
            Instructors
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Everyone with instructor access, and what they've built.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mt-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 placeholder:text-slate-400"
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Grid of instructor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {loading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}

        {!loading &&
          filtered.map((inst) => (
            <Link
              key={inst.id}
              to={`/admin/instructors/${inst.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-semibold shrink-0" style={display}>
                  {inst.name?.charAt(0)?.toUpperCase() || <UserCog size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {inst.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{inst.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.totalCourses}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Courses
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.publishedCourses}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Live
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900" style={display}>
                    {inst.totalStudents}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400" style={mono}>
                    Students
                  </p>
                </div>
              </div>
            </Link>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No instructors match your search.
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateInstructorModal
          onClose={() => setModalOpen(false)}
          onCreated={(newUser) =>
            setInstructors((prev) => [
              {
                ...newUser,
                totalCourses: 0,
                publishedCourses: 0,
                totalStudents: 0,
              },
              ...prev,
            ])
          }
        />
      )}
    </div>
  );
}