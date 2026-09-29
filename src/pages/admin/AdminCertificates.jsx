import { useState } from "react";
import { Award, Clock3 } from "lucide-react";

import AdminCertificateRequests from "./AdminCertificateRequests";
import AdminIssuedCertificates from "./AdminIssuedCertificates";

const AdminCertificates = () => {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          admin_panel
        </span>

        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Certificates
        </h1>

        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Manage certificate requests and issued certificates.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
              activeTab === "requests"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-sky-700"
            }`}
          >
            <Clock3 className="h-4 w-4" />
            Certificate Requests
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("issued")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
              activeTab === "issued"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-sky-700"
            }`}
          >
            <Award className="h-4 w-4" />
            Issued Certificates
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "requests" && (
        <AdminCertificateRequests />
      )}

      {activeTab === "issued" && (
        <AdminIssuedCertificates />
      )}
    </div>
  );
};

export default AdminCertificates;