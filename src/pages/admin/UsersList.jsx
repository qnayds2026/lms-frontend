import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Shield,
  Search,
  UserCog,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const PAGE_SIZE = 8;

const ROLE_STYLES = {
  STUDENT: "bg-sky-50 text-sky-700",
  INSTRUCTOR: "bg-amber-50 text-amber-700",
  ADMIN: "bg-rose-50 text-rose-700",
};

function StatCard({ title, value, icon, color }) {
  const colors = {
    sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600",
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60 transition">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${colors[color]} group-hover:text-white`}
      >
        {icon}
      </div>
      <p className="text-slate-500 mt-4 text-sm">{title}</p>
      <h2
        className="text-3xl font-semibold text-slate-900 mt-1"
        style={display}
      >
        {value}
      </h2>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

function initialsOf(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

// View details modal — GET /users/:id
function UserDetailsModal({ userId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setDetails(null);

    (async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        if (!cancelled) setDetails(res.data?.data || res.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={display}
            >
              User Details
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3 min-h-55 justify-center">
              <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
              <p className="text-sm text-slate-400">Loading...</p>
            </div>
          ) : !details ? (
            <div className="p-10 text-center min-h-55 flex flex-col items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                Couldn't load this user.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <span
                  className="h-16 w-16 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg font-semibold"
                  style={display}
                >
                  {initialsOf(details.name)}
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">
                  {details.name}
                </h3>
                <span
                  className={`mt-2 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    ROLE_STYLES[details.role] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {details.role}
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-700 truncate">
                    {details.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-700">
                    {details.phone || "Not added"}
                  </p>
                </div>
                {details.createdAt && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700">
                      Joined {new Date(details.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit modal — PUT /users/:id
function EditUserModal({ user, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "STUDENT",
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, form);
  };

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-slate-100">
            <h2
              className="text-lg sm:text-xl font-semibold text-slate-900"
              style={display}
            >
              Edit User
            </h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-6 space-y-4">
            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                required
              />
            </div>

            <div>
              <label
                className="text-xs font-medium text-slate-500"
                style={mono}
              >
                email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-medium text-slate-500"
                  style={mono}
                >
                  role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-medium text-slate-500"
                  style={mono}
                >
                  status
                </label>
                <select
                  name="isActive"
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isActive: e.target.value === "true",
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal — DELETE /users/:id
function DeleteUserModal({ user, onClose, onConfirm, deleting }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900 text-lg">
            Remove this user?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {`"${user.name}" will be permanently removed from the platform.`}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [viewingId, setViewingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // GET /users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const list = res.data?.data || res.data || [];
      setUsers(list);
      setFilteredUsers(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (search) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFilteredUsers(result);
    setPage(1);
  }, [search, roleFilter, users]);

  // PUT /users/:id
  const handleSaveUser = async (id, form) => {
    try {
      setSaving(true);
      const res = await api.put(`/users/${id}`, form);
      const updated = res.data?.data || res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      );
      setEditingUser(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // DELETE /users/:id
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);

      const updatedUser = res.data;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, isActive: updatedUser.isActive }
            : u
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const totalUsers = users.length;
  const students = users.filter((u) => u.role === "STUDENT").length;
  const instructors = users.filter((u) => u.role === "INSTRUCTOR").length;
  const admins = users.filter((u) => u.role === "ADMIN").length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const rangeStart =
    filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredUsers.length);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
          style={mono}
        >
          users_panel
        </span>
        <h1
          className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900"
          style={display}
        >
          Users Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Manage students, instructors, and admins.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="sky"
        />
        <StatCard
          title="Students"
          value={students}
          icon={<GraduationCap className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Instructors"
          value={instructors}
          icon={<UserCog className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Admins"
          value={admins}
          icon={<Shield className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:bg-white transition"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="INSTRUCTOR">Instructors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="p-14 text-center">
            <Users className="w-9 h-9 mx-auto text-slate-300" />
            <p className="mt-4 text-slate-500 text-sm">No users found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                      Role
                    </th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-500 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 font-medium text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-medium"
                            style={display}
                          >
                            {initialsOf(user.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-400 sm:hidden truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                        {user.email}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ROLE_STYLES[user.role] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingId(user.id)}
                            title="View"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={user.isActive ? "Deactivate" : "Activate"}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              user.isActive
                                ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                                : "text-slate-400 hover:text-green-500 hover:bg-green-50"
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400" style={mono}>
                showing {rangeStart}-{rangeEnd} of {filteredUsers.length}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1.5 text-slate-300 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition ${
                          p === page
                            ? "bg-sky-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <UserDetailsModal userId={viewingId} onClose={() => setViewingId(null)} />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
        saving={saving}
      />

      <DeleteUserModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        deleting={deleting}
      />
    </div>
  );
};

export default UsersList;