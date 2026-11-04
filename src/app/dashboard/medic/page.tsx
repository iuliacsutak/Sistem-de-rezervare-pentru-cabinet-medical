"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Settings,
  RefreshCw,
  AlertCircle,
  Edit3,
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
    cnp?: string;
  };
  serviciuId?: {
    _id: string;
    denumire: string;
    pret: number;
    durataMinute: number;
  };
}

export default function DoctorDashboard() {
  const [programari, setProgramari] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal / Form state for diagnostic
  const [activeModalAppt, setActiveModalAppt] = useState<AppointmentItem | null>(null);
  const [diagnosticText, setDiagnosticText] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const [todayStr, setTodayStr] = useState("");

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
    setTodayStr(new Date().toDateString());
    fetchProgramari();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, diagnostic?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/programari/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          diagnosticSauObservatii: diagnostic,
        }),
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

  const openDiagnosticModal = (item: AppointmentItem) => {
    setActiveModalAppt(item);
    setDiagnosticText(item.diagnosticSauObservatii || "");
  };

  const handleSaveDiagnostic = async () => {
    if (!activeModalAppt) return;
    setModalSaving(true);
    try {
      await handleUpdateStatus(activeModalAppt._id, "COMPLETED", diagnosticText);
      setActiveModalAppt(null);
    } finally {
      setModalSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmată
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> În Așteptare
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3.5 h-3.5" /> Finalizată
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" /> Anulată
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const filteredProgramari = programari.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  const programariAzi = programari.filter((p) => todayStr && new Date(p.dataOra).toDateString() === todayStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              Portal Medic
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Agenda Consultațiilor Mele</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestionare pacienți programați, consemnare fișă de consult și prescripții.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/medic/orar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configurare Program Lucru</span>
          </Link>
          <button
            onClick={fetchProgramari}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Reîmprospătează"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consultații Programate Astăzi
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{programariAzi.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total În Așteptare / Confirmate
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {programari.filter((p) => p.status === "CONFIRMED" || p.status === "PENDING").length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consultații Finalizate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {programari.filter((p) => p.status === "COMPLETED").length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "ALL" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Toate ({programari.length})
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "PENDING" ? "bg-amber-600 text-white font-semibold" : "text-amber-800 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          De Confirmat ({programari.filter((p) => p.status === "PENDING").length})
        </button>
        <button
          onClick={() => setFilter("CONFIRMED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "CONFIRMED" ? "bg-emerald-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Confirmate ({programari.filter((p) => p.status === "CONFIRMED").length})
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "COMPLETED" ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Finalizate ({programari.filter((p) => p.status === "COMPLETED").length})
        </button>
        <button
          onClick={() => setFilter("CANCELLED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "CANCELLED" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Respinse / Anulate ({programari.filter((p) => p.status === "CANCELLED").length})
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Se încarcă agenda...
        </div>
      ) : filteredProgramari.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Nu aveți programări înregistrate</h3>
          <p className="text-xs text-slate-500">
            Pacienții care se vor programa online vor apărea instant în această agendă.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProgramari.map((item) => {
            const dateObj = new Date(item.dataOra);
            const dateStr = dateObj.toLocaleDateString("ro-RO", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Left: Patient & Appointment Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                      {dateStr} &bull; ora {timeStr}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-slate-500 font-medium">
                      Durată: {item.durataMinute} min
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <h4 className="text-base font-bold text-slate-900">
                      {item.pacientId?.nume || "Pacient Necunoscut"}
                    </h4>
                    {item.pacientId?.telefon && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" /> {item.pacientId.telefon}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Serviciu:</span>{" "}
                    {item.serviciuId?.denumire || "Consultație"} ({item.serviciuId?.pret} RON)
                  </div>

                  {item.motiv && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Motivul vizitei:</span> {item.motiv}
                    </div>
                  )}

                  {item.diagnosticSauObservatii && (
                    <div className="text-xs bg-emerald-50/70 text-emerald-900 p-3 rounded-xl border border-emerald-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <FileText className="w-3.5 h-3.5" /> Diagnostic & Recomandări:
                      </div>
                      <p className="whitespace-pre-line">{item.diagnosticSauObservatii}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions for Doctor */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
                  {item.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item._id, "CONFIRMED")}
                        disabled={actionLoading === item._id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirmă</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Sigur doriți să respingeți această programare?")) {
                            handleUpdateStatus(item._id, "CANCELLED", "Programare respinsă de medic.");
                          }
                        }}
                        disabled={actionLoading === item._id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Respinge</span>
                      </button>
                    </>
                  )}

                  {item.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => openDiagnosticModal(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Finalizează & Scrie Fișa</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Sigur doriți să anulați consultația?")) {
                            handleUpdateStatus(item._id, "CANCELLED", "Consultație anulată de medic.");
                          }
                        }}
                        disabled={actionLoading === item._id}
                        className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Anulează
                      </button>
                    </>
                  )}

                  {item.status === "COMPLETED" && (
                    <button
                      onClick={() => openDiagnosticModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editează Fișa Medicală</span>
                    </button>
                  )}

                  {item.status === "CANCELLED" && (
                    <span className="text-xs text-red-500 font-medium italic">
                      Respinsă / Anulată
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Doctor Diagnostic / Completion */}
      {activeModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Fișă Consultație & Diagnostic</h3>
                <p className="text-xs text-slate-500">
                  Pacient: {activeModalAppt.pacientId?.nume}
                </p>
              </div>
              <button
                onClick={() => setActiveModalAppt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Consemnare Medicală / Diagnostic / Prescripție
              </label>
              <textarea
                rows={5}
                value={diagnosticText}
                onChange={(e) => setDiagnosticText(e.target.value)}
                placeholder="Exemplu: Tensiune 125/80 mmHg, ritm sinusal regulat. Diagnostic: HTA stadiul 1 sub control. Recomandări: Continuare tratament, scădere aport sare, control peste 3 luni."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleSaveDiagnostic}
                disabled={modalSaving}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{modalSaving ? "Se salvează..." : "Salvează și Finalizează"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
