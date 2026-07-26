"use client";

import { useEffect, useState } from "react";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";
import { useAdmin } from "@/core/context/AdminContext";
import { apiFetch } from "@/api/client";

type CareerApplicationStatus = "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED" | "HIRED";

type CareerApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  coverLetter: string;
  status: CareerApplicationStatus;
  adminNotes: string | null;
  createdAt: string;
  user?: {
    name: string | null;
    email: string;
  };
};

const STATUS_COLORS: Record<CareerApplicationStatus, { bg: string; text: string; border: string }> = {
  APPLIED: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  UNDER_REVIEW: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  SHORTLISTED: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  REJECTED: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/20" },
  HIRED: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
};

export default function AdminCareersPage() {
  const { token } = useAdmin();
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null);

  const loadApplications = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter !== "ALL" ? `/api/careers/applications?status=${statusFilter}` : "/api/careers/applications";
      const res = await apiFetch<{ success: boolean; data: CareerApplication[] }>(url, { token });
      if (res.success) {
        setApplications(res.data);
      } else {
        setError("Failed to fetch career applications.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: CareerApplicationStatus) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await apiFetch<{ success: boolean; data: CareerApplication }>(
        `/api/careers/applications/${id}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedApp?.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err: any) {
      alert("Failed to update application status: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.phone.toLowerCase().includes(query) ||
      app.portfolioUrl.toLowerCase().includes(query) ||
      app.coverLetter.toLowerCase().includes(query)
    );
  });

  return (
    <AdminAppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-blue-600">Recruitment & Talent</p>
            <h1 className="text-2xl font-black text-[#222222]">Career Applications</h1>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Review speculative job applications, candidate pitches, and manage applicant pipeline status.
            </p>
          </div>
          <button
            onClick={loadApplications}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-xs font-extrabold text-[#222222] shadow-xs transition hover:bg-zinc-50"
          >
            <AdminIcon name="refresh" className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by candidate name, email, phone, pitch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-300 bg-white px-3.5 text-xs font-semibold text-[#222222] placeholder-zinc-400 focus:border-[#1CA2D1] focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "HIRED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-9 px-3 text-xs font-extrabold rounded-lg border transition ${
                  statusFilter === status
                    ? "bg-[#222222] border-[#222222] text-white"
                    : "bg-white border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-[#222222]"
                }`}
              >
                {status === "ALL" ? "All Applications" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 text-zinc-500 text-xs font-semibold">
              <span className="size-4 animate-spin rounded-full border-2 border-[#222222] border-t-transparent"></span>
              <span>Loading career applications...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-zinc-200 bg-white text-center space-y-3 shadow-xs">
            <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
              <AdminIcon name="careers" className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#222222]">No Career Applications Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              No job applications match the selected status or search query.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-12">
            
            {/* List */}
            <div className={`${selectedApp ? "lg:col-span-6" : "lg:col-span-12"} space-y-3`}>
              {filteredApplications.map((app) => {
                const colors = STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED;
                const isSelected = selectedApp?.id === app.id;

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-xs ${
                      isSelected
                        ? "border-[#1CA2D1] bg-white ring-2 ring-[#1CA2D1]/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#222222]">{app.name}</h3>
                        <p className="text-xs font-semibold text-zinc-500 mt-0.5">{app.email} • {app.phone}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-extrabold tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-zinc-600 line-clamp-2 font-medium bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                      {app.coverLetter}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] font-semibold text-zinc-500">
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#1CA2D1] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Portfolio / Links</span>
                        <span>↗</span>
                      </a>
                      <span>Submitted: {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Drawer Side View */}
            {selectedApp && (
              <div className="lg:col-span-6 rounded-2xl border border-zinc-200 bg-white p-6 space-y-6 sticky top-6 self-start max-h-[85vh] overflow-y-auto shadow-sm">
                <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-[#222222]">{selectedApp.name}</h2>
                    <p className="text-xs font-semibold text-zinc-500 mt-0.5">Application #{selectedApp.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-[#222222]"
                  >
                    ✕
                  </button>
                </div>

                {/* Status Update Control */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Update Pipeline Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "HIRED"] as CareerApplicationStatus[]).map((st) => (
                      <button
                        key={st}
                        disabled={updatingId === selectedApp.id}
                        onClick={() => handleStatusChange(selectedApp.id, st)}
                        className={`h-9 px-2 text-[11px] font-extrabold rounded-xl border transition cursor-pointer ${
                          selectedApp.status === st
                            ? "bg-[#222222] text-white border-[#222222]"
                            : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold">Email:</span>
                    <a href={`mailto:${selectedApp.email}`} className="text-[#1CA2D1] font-bold hover:underline">{selectedApp.email}</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold">Phone:</span>
                    <span className="text-[#222222] font-bold">{selectedApp.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold">Portfolio / GitHub:</span>
                    <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="text-[#1CA2D1] font-bold hover:underline truncate max-w-[200px]">
                      {selectedApp.portfolioUrl}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold">Date Submitted:</span>
                    <span className="text-zinc-700 font-medium">{new Date(selectedApp.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Cover Letter & Pitch Summary</h4>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800 font-medium whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </AdminAppShell>
  );
}
