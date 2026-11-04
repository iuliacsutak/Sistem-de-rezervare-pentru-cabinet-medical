"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface AppointmentItem {
  _id: string;
  dataOra: string;
  durataMinute: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  motiv?: string;
  diagnosticSauObservatii?: string;
  pacientId?: {
    _id: string;
    nume: string;
    email: string;
    telefon?: string;
  };
  medicId?: {
    _id: string;
    userId?: { nume: string };
    specializareId?: { denumire: string };
  };
  serviciuId?: {
    _id: string;
    denumire: string;
    pret: number;
  };
}

export default function AdminAppointmentsPage() {
  const [programari, setProgramari] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProgramari = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/programari");
      if (res.ok) {
        const data = await res.json();
        setProgramari(data.programari || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramari();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/programari/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProgramari();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = programari.filter((p) => {
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const patientName = p.pacientId?.nume?.toLowerCase() || "";
      const doctorName = p.medicId?.userId?.nume?.toLowerCase() || "";
      const serviceName = p.serviciuId?.denumire?.toLowerCase() || "";
      return patientName.includes(q) || doctorName.includes(q) || serviceName.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registru Toate Programările</h1>
            <p className="text-xs text-slate-500">
              Evidența centralizată a tuturor consultațiilor din cadrul cabinetului medical.
            </p>
          </div>
        </div>

        <button
          onClick={fetchProgramari}
          className="p-2.5 self-start sm:self-auto text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors"
          title="Reîmprospătează"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Caută după pacient, medic sau serviciu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {["ALL", "CONFIRMED", "COMPLETED", "PENDING", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === st
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st === "ALL" ? "Toate" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Dată / Oră</th>
                <th className="py-3 px-4 font-semibold">Pacient</th>
                <th className="py-3 px-4 font-semibold">Medic Specialist</th>
                <th className="py-3 px-4 font-semibold">Serviciu & Preț</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Schimbă Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Se încarcă programările...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nu a fost găsită nicio programare care să corespundă filtrelor.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const d = new Date(item.dataOra);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {d.toLocaleDateString("ro-RO")}
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold">
                          ora {d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.pacientId?.nume || "Anonim"}</div>
                        {item.pacientId?.telefon && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.pacientId.telefon}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {item.medicId?.userId?.nume || "Medic"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.medicId?.specializareId?.denumire}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.serviciuId?.denumire}</div>
                        <div className="text-[11px] font-bold text-emerald-700">
                          {item.serviciuId?.pret} RON
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, "COMPLETED")}
                              disabled={actionLoading === item._id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold"
                              title="Marchează Finalizată"
                            >
                              Finalizează
                            </button>
                          )}
                          {item.status !== "CONFIRMED" && item.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, "CONFIRMED")}
                              disabled={actionLoading === item._id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold"
                              title="Confirmă"
                            >
                              Confirmă
                            </button>
                          )}
                          {item.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, "CANCELLED")}
                              disabled={actionLoading === item._id}
                              className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold"
                              title="Anulează"
                            >
                              Anulează
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

