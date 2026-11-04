"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal,
  RefreshCw,
  Trash2,
  Filter,
  Shield,
  Key,
  Calendar,
  AlertTriangle,
  Globe,
  User,
} from "lucide-react";

interface LogEntry {
  _id: string;
  dataOra: string;
  nivel: "INFO" | "WARN" | "ERROR" | "AUTH" | "PROGRAMARE" | "ADMIN" | "HTTP";
  metoda: string;
  ruta: string;
  mesaj: string;
  utilizatorEmail: string;
  utilizatorRol: string;
  ip: string;
  detalii?: unknown;
}

export default function AdminLogsPage() {
  const [loguri, setLoguri] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNivel, setFilterNivel] = useState("TOATE");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/loguri?nivel=${filterNivel}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setLoguri(data.loguri || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNivel]);

  // Periodic auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, filterNivel]);

  const handleClearLogs = async () => {
    if (!confirm("Sigur doriți să ștergeți toate înregistrările din jurnalul de audit?")) return;
    try {
      const res = await fetch("/api/loguri", { method: "DELETE" });
      if (res.ok) {
        setLoguri([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case "HTTP":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
            <Globe className="w-3 h-3" /> HTTP
          </span>
        );
      case "AUTH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <Key className="w-3 h-3" /> AUTH
          </span>
        );
      case "PROGRAMARE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <Calendar className="w-3 h-3" /> PROGRAMARE
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3" /> ADMIN
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3" /> EROARE
          </span>
        );
      case "WARN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" /> AVERTISMENT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
            {nivel}
          </span>
        );
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-mono flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> Jurnal & Audit Sistem
              </span>
              {autoRefresh && (
                <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                  ● Live (5s)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Logging Concret pe Toate Rutele
            </h1>
            <p className="text-xs text-slate-500">
              Urmărirea în timp real a tuturor cererilor HTTP, evenimentelor de autentificare și modificărilor din baza de date.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              autoRefresh
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Auto-refresh: {autoRefresh ? "Activ" : "Inactiv"}
          </button>

          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors"
            title="Reîmprospătează"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
            title="Curăță logurile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium overflow-x-auto">
        <span className="text-slate-400 flex items-center gap-1 pl-1 pr-2">
          <Filter className="w-3.5 h-3.5" /> Filtru:
        </span>
        {["TOATE", "HTTP", "AUTH", "PROGRAMARE", "ADMIN", "ERROR"].map((nv) => (
          <button
            key={nv}
            onClick={() => setFilterNivel(nv)}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              filterNivel === nv
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {nv}
          </button>
        ))}
      </div>

      {/* Terminal Style Logs Display */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-2 text-[11px] text-slate-400">terminal.log - {loguri.length} evenimente înregistrate</span>
          </div>
          <span className="text-[11px] text-slate-500">MongoDB Collection: SystemLog</span>
        </div>

        <div className="divide-y divide-slate-900 max-h-[600px] overflow-y-auto p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Se încarcă logurile...</div>
          ) : loguri.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nu există înregistrări pentru filtrul selectat. Efectuați acțiuni în aplicație pentru a genera loguri.
            </div>
          ) : (
            loguri.map((log) => {
              const d = new Date(log.dataOra);
              const timeStr = d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const dateStr = d.toLocaleDateString("ro-RO");

              return (
                <div
                  key={log._id}
                  className="p-3 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 text-[11px]">
                        [{dateStr} {timeStr}]
                      </span>
                      {getNivelBadge(log.nivel)}
                      <span className="text-cyan-400 font-bold">
                        {log.metoda} {log.ruta}
                      </span>
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {log.utilizatorEmail} ({log.utilizatorRol})
                      </span>
                    </div>

                    <div className="text-slate-200 text-xs pl-0.5">{log.mesaj}</div>

                    {log.detalii ? (
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800/80 overflow-x-auto">
                        {typeof log.detalii === "object" ? JSON.stringify(log.detalii) : String(log.detalii)}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-[11px] text-slate-500 shrink-0 self-end md:self-center font-mono">
                    IP: {log.ip || "127.0.0.1"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

