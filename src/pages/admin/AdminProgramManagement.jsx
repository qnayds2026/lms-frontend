import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Power,
  PowerOff,
  Users,
  CalendarDays,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import ProgramRegistrations from "../../components/admin/ProgramRegistrations";

const PROGRAM_TYPES = ["WEBINAR", "INTERNSHIP", "WORKSHOP"];

const emptyForm = {
  title: "",
  description: "",
  type: "WEBINAR",
  startDate: "",
  endDate: "",
  isActive: true,
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInput = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const AdminProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});

  const [loading, setLoading] = useState(true);
  const [countLoading, setCountLoading] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);
  const [registrationsProgram, setRegistrationsProgram] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // -----------------------------------------
  // GET ALL PROGRAMS
  // -----------------------------------------
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/programs");

      const data = response?.data?.data || [];

      setPrograms(data);
    } catch (err) {
      console.error("Failed to fetch programs:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load programs. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // GET REGISTRATION COUNTS
  // -----------------------------------------
  const fetchRegistrationCounts = async (programList) => {
    if (!programList?.length) {
      setRegistrationCounts({});
      return;
    }

    try {
      setCountLoading(true);

      const results = await Promise.all(
        programList.map(async (program) => {
          try {
            const response = await api.get(
              `/programs/${program.id}/registrations`,
            );

            const registrations =
              response?.data?.data ||
              response?.data?.registrations ||
              [];

            return {
              id: program.id,
              count: Array.isArray(registrations)
                ? registrations.length
                : response?.data?.count || 0,
            };
          } catch (err) {
            console.error(
              `Failed to fetch registrations for program ${program.id}:`,
              err,
            );

            return {
              id: program.id,
              count: 0,
            };
          }
        }),
      );

      const counts = {};

      results.forEach((item) => {
        counts[item.id] = item.count;
      });

      setRegistrationCounts(counts);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (programs.length > 0) {
      fetchRegistrationCounts(programs);
    } else {
      setRegistrationCounts({});
    }
  }, [programs]);

  // -----------------------------------------
  // OPEN CREATE MODAL
  // -----------------------------------------
  const openCreateModal = () => {
    setEditingProgram(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // -----------------------------------------
  // OPEN EDIT MODAL
  // -----------------------------------------
  const openEditModal = (program) => {
    setEditingProgram(program);

    setForm({
      title: program.title || "",
      description: program.description || "",
      type: program.type || "WEBINAR",
      startDate: toDateInput(program.startDate),
      endDate: toDateInput(program.endDate),
      isActive: program.isActive ?? true,
    });

    setShowModal(true);
  };

  // -----------------------------------------
  // CLOSE MODAL
  // -----------------------------------------
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProgram(null);
    setForm(emptyForm);
  };

  // -----------------------------------------
  // FORM CHANGE
  // -----------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -----------------------------------------
  // CREATE / UPDATE
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showMessage("Program title is required.", "error");
      return;
    }

    if (!form.type) {
      showMessage("Program type is required.", "error");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      showMessage(
        "End date cannot be earlier than the start date.",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      };

      if (editingProgram) {
        const response = await api.patch(
          `/programs/${editingProgram.id}`,
          payload,
        );

        showMessage(
          response?.data?.message || "Program updated successfully.",
        );
      } else {
        const response = await api.post("/programs", payload);

        showMessage(
          response?.data?.message || "Program created successfully.",
        );
      }

      closeModal();
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to save program:", err);

      showMessage(
        err?.response?.data?.message ||
          "Failed to save program. Please try again.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // ACTIVATE / DEACTIVATE
  // -----------------------------------------
  const handleStatusChange = async (program) => {
    const action = program.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${program.title}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(program.id);

      const endpoint = program.isActive
        ? `/programs/${program.id}/deactivate`
        : `/programs/${program.id}/activate`;

      const response = await api.patch(endpoint);

      showMessage(
        response?.data?.message ||
          `Program ${action}d successfully.`,
      );

      await fetchPrograms();
    } catch (err) {
      console.error("Failed to change program status:", err);

      showMessage(
        err?.response?.data?.message ||
          "Failed to update program status.",
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // -----------------------------------------
  // REFRESH
  // -----------------------------------------
  const handleRefresh = async () => {
    await fetchPrograms();
  };

  return (
    <div className="space-y-6">
      {/* Toast / Message */}
      {message && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {messageType === "error" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              ✓
            </span>
          )}

          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-600">
            Admin
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Program Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, edit and manage webinars, internships and
            workshops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Create Program
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">Unable to load programs</p>
            <p className="mt-1">{error}</p>
          </div>

          <button
            onClick={fetchPrograms}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Programs
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {programs.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Programs
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {programs.filter((program) => program.isActive).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Registrations
            </p>

            <p className="mt-2 text-2xl font-semibold text-sky-600">
              {Object.values(registrationCounts).reduce(
                (total, count) => total + Number(count || 0),
                0,
              )}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            Loading programs...
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && programs.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300" />

          <h3 className="mt-3 text-base font-semibold text-slate-800">
            No programs found
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            Create your first webinar, internship or workshop
            program.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Create Program
          </button>
        </div>
      )}

      {/* Programs Table */}
      {!loading && !error && programs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Program
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Registrations
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {programs.map((program) => (
                  <tr
                    key={program.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Program */}
                    <td className="px-5 py-4">
                      <div className="max-w-[300px]">
                        <p className="font-medium text-slate-900">
                          {program.title}
                        </p>

                        {program.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {program.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                        {program.type}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        <div>
                          <p>{formatDate(program.startDate)}</p>

                          <p className="text-xs text-slate-400">
                            to {formatDate(program.endDate)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Registrations */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Users className="h-4 w-4 text-slate-400" />

                        {countLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                          <span>
                            {registrationCounts[program.id] ?? 0}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {program.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRegistrationsProgram(program)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Registrations
                        </button>
                        <button
                          onClick={() => openEditModal(program)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(program)
                          }
                          disabled={actionLoading === program.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                            program.isActive
                              ? "border border-red-200 text-red-600 hover:bg-red-50"
                              : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {actionLoading === program.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : program.isActive ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}

                          {program.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
     {registrationsProgram && (
        <ProgramRegistrations
          program={registrationsProgram}
          onClose={() => setRegistrationsProgram(null)}
        />
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingProgram
                    ? "Edit Program"
                    : "Create Program"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingProgram
                    ? "Update the program details."
                    : "Add a new external program."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter program title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Type *
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  {PROGRAM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter program description"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Active Program
                  </p>

                  <p className="text-xs text-slate-500">
                    Make this program active immediately.
                  </p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingProgram
                    ? "Update Program"
                    : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramManagement;