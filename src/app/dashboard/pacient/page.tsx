"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlusCircle,
  FileText,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface AppointmentItem {
  _id: string;
  dataOra: string;
  durataMinute: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  motiv?: string;
  diagnosticSauObservatii?: string;
  medicId?: {
    _id: string;
    titlu?: string;
    numarCabinet?: string;
    userId?: { nume: string; email: string; telefon: string };
    specializareId?: { denumire: string };
  };
  serviciuId?: {
    _id: string;
    denumire: string;
    pret: number;
    durataMinute: number;
  };
}
interface SlotItem {
  ora: string;
  disponibil: boolean;
}

export default function PatientDashboard() {
  const [programari, setProgramari] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reprogramId, setReprogramId] = useState<string | null>(null);
  const [reprogramData, setReprogramData] = useState("");
  const [reprogramSloturi, setReprogramSloturi] = useState<SlotItem[]>([]);
  const [reprogramSlot, setReprogramSlot] = useState("");
  const [loadingSloturi, setLoadingSloturi] = useState(false);

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

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Sunteți sigur că doriți să anulați această programare?")) return;

    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/programari/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Programarea a fost anulată cu succes." });
        fetchProgramari();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la anularea programării." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de rețea." });
    } finally {
      setActionLoading(null);
    }
  };
    const incarcaSloturi = async (medicId: string, data: string) => {
    setLoadingSloturi(true);
    setReprogramSlot("");
    try {
      const res = await fetch(`/api/medici/${medicId}/sloturi?data=${data}`);
      const json = await res.json();
      setReprogramSloturi(json.success ? json.sloturi || [] : []);
    } catch {
      setReprogramSloturi([]);
    } finally {
      setLoadingSloturi(false);
    }
  };

  const deschideReprogramare = (item: AppointmentItem) => {
    if (!item.medicId) return;
    const maine = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setReprogramId(item._id);
    setReprogramData(maine);
    incarcaSloturi(item.medicId._id, maine);
  };

  const inchideReprogramare = () => {
    setReprogramId(null);
    setReprogramSloturi([]);
    setReprogramSlot("");
  };

  const handleReschedule = async (id: string) => {
    if (!reprogramSlot) return;

    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/programari/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataOra: `${reprogramData}T${reprogramSlot}:00` }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: "Programarea a fost reprogramată și așteaptă confirmarea medicului.",
        });
        inchideReprogramare();
        fetchProgramari();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la reprogramare." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de rețea." });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmată de Medic
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> În Așteptare (Confirmare Medic)
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3.5 h-3.5" /> Finalizată
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" /> Respinsă / Anulată
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

  const activeCount = programari.filter((p) => p.status === "CONFIRMED" || p.status === "PENDING").length;
  const completedCount = programari.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Portal Pacient
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Programările Mele Medicale</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Istoric consultații, status programări și rezervare online rapidă.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pacient/programeaza"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Programare Nouă</span>
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

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="underline ml-4">
            Închide
          </button>
        </div>
      )}

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Programări Active
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">{activeCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consultații Finalizate
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Înregistrări
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{programari.length}</div>
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
          onClick={() => setFilter("CONFIRMED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "CONFIRMED" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Confirmate
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "COMPLETED" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Finalizate
        </button>
        <button
          onClick={() => setFilter("CANCELLED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "CANCELLED" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Anulate
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Se încarcă programările...
        </div>
      ) : filteredProgramari.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Nu aveți nicio programare înregistrată</h3>
            <p className="text-xs text-slate-500 mt-1">
              Puteți rezerva o consultație rapid selectând medicul și ora dorită.
            </p>
          </div>
          <Link
            href="/dashboard/pacient/programeaza"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Programează-te acum
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProgramari.map((item) => {
            const dateObj = new Date(item.dataOra);
            const dateStr = dateObj.toLocaleDateString("ro-RO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const canCancel = item.status === "PENDING" || item.status === "CONFIRMED";

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Left: Date & Time Highlight */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-700 shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {dateObj.toLocaleDateString("ro-RO", { month: "short" })}
                    </span>
                    <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 capitalize">{dateStr}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {timeStr}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {item.serviciuId?.denumire || "Consultație Medicală"}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.medicId?.userId?.nume || "Medic"} ({item.medicId?.specializareId?.denumire})
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.medicId?.numarCabinet || "Cabinet 1"}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-800">
                        {item.serviciuId?.pret} RON
                      </span>
                    </div>

                    {item.motiv && (
                      <p className="text-xs text-slate-500 italic mt-1">
                        Motiv: &ldquo;{item.motiv}&rdquo;
                      </p>
                    )}
                                        {reprogramId === item._id && (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="text-xs font-bold text-slate-800">
                          Alege noua dată și oră
                        </div>

                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={reprogramData}
                          onChange={(e) => {
                            setReprogramData(e.target.value);
                            if (item.medicId) incarcaSloturi(item.medicId._id, e.target.value);
                          }}
                          className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {loadingSloturi ? (
                          <p className="text-xs text-slate-500">Se verifică disponibilitatea...</p>
                        ) : reprogramSloturi.length === 0 ? (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                            Nu sunt ore disponibile în această zi. Alege altă dată.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {reprogramSloturi.map((slot) => (
                              <button
                                key={slot.ora}
                                disabled={!slot.disponibil}
                                onClick={() => setReprogramSlot(slot.ora)}
                                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                  !slot.disponibil
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
                                    : reprogramSlot === slot.ora
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                                }`}
                              >
                                {slot.ora}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReschedule(item._id)}
                            disabled={!reprogramSlot || actionLoading === item._id}
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === item._id ? "Se salvează..." : "Confirmă reprogramarea"}
                          </button>
                          <button
                            onClick={inchideReprogramare}
                            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            Renunță
                          </button>
                        </div>
                      </div>
                    )}

                    {item.diagnosticSauObservatii && (
                      <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <FileText className="w-3.5 h-3.5" /> Recomandări & Diagnostic Medic:
                        </div>
                        <p className="whitespace-pre-line">{item.diagnosticSauObservatii}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  {canCancel && (
                                <>    <button
                      onClick={() => deschideReprogramare(item)}
                      className="px-3.5 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      Reprogramează
                    </button>
                   <button
                      onClick={() => handleCancelAppointment(item._id)}
                      disabled={actionLoading === item._id}
                      className="px-3.5 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading === item._id ? "Se anulează..." : "Anulează Programarea"}
                    </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
