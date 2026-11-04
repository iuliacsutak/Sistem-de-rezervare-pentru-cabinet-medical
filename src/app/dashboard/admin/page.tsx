"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  RefreshCw,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
} from "lucide-react";

interface StatsData {
  totalPacienti: number;
  totalMedici: number;
  totalProgramari: number;
  programariConfirmate: number;
  programariFinalizate: number;
  programariAnulate: number;
  programariInAsteptare: number;
  venitTotal: number;
}

interface RecentAppointment {
  _id: string;
  dataOra: string;
  status: string;
  pacientId?: { nume: string; email: string; telefon?: string };
  medicId?: {
    userId?: { nume: string };
    specializareId?: { denumire: string };
  };
  serviciuId?: { denumire: string; pret: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/statistici");
      if (res.ok) {
        const data = await res.json();
        setStats(data.statistici);
        setRecentAppointments(data.ultimeleProgramari || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDatabase = async (reset: boolean) => {
    if (reset && !confirm("Sunteți sigur că doriți resetarea completă a bazei de date cu datele inițiale de test?")) {
      return;
    }

    setSeedLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/seed?reset=${reset}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Baza de date a fost populată/resetată cu succes cu conturi demonstrative.");
        fetchStats();
      } else {
        setMessage("Eroare la popularea bazei de date.");
      }
    } catch {
      setMessage("Eroare de rețea.");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Portal Administrator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Panou Central de Administrare</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitorizare parametri clinici, evidență medici, servicii medicale și programări.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSeedDatabase(true)}
            disabled={seedLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
            title="Resetează baza de date cu datele de test"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>{seedLoading ? "Se resetează..." : "Re-populare Date Test"}</span>
          </button>

          <button
            onClick={fetchStats}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Reîmprospătează"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="underline ml-4">
            Închide
          </button>
        </div>
      )}

      {/* Admin Module Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/admin/medici"
          className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Gestiune Medici</h3>
              <p className="text-xs text-slate-500">Cabinete & medici</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/admin/servicii"
          className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Servicii & Tarife</h3>
              <p className="text-xs text-slate-500">Tarife, durate, secții</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/admin/programari"
          className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Toate Programările</h3>
              <p className="text-xs text-slate-500">Monitorizare globală</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/admin/loguri"
          className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Jurnal & Logging</h3>
              <p className="text-xs text-slate-500">Audit rute & securitate</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pacienți Înregistrați</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats ? stats.totalPacienti : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Utilizatori cu cont activ</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Medici Specialiști</span>
            <Stethoscope className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats ? stats.totalMedici : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cadre medicale active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Programări</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats ? stats.totalProgramari : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats ? `${stats.programariFinalizate} finalizate` : ""}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Încasări Estimate</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {stats ? `${stats.venitTotal} RON` : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Din consultații finalizate</p>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Ultimele Programări Înregistrate</h3>
            <p className="text-xs text-slate-500">Activitate recentă în platformă</p>
          </div>
          <Link
            href="/dashboard/admin/programari"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            Vezi toate &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Dată / Oră</th>
                <th className="py-3 px-4 font-semibold">Pacient</th>
                <th className="py-3 px-4 font-semibold">Medic</th>
                <th className="py-3 px-4 font-semibold">Serviciu</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nu există programări recente.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((app) => {
                  const d = new Date(app.dataOra);
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {d.toLocaleDateString("ro-RO")} {d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {app.pacientId?.nume || "Anonim"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.medicId?.userId?.nume || "Medic"} ({app.medicId?.specializareId?.denumire})
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.serviciuId?.denumire} ({app.serviciuId?.pret} RON)
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : app.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.status}
                        </span>
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

