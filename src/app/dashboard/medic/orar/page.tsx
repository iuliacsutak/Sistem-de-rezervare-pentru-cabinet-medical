"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Save, CheckCircle, AlertCircle } from "lucide-react";
import { IWorkingHours } from "@/lib/types";

const ZILE = [
  { id: 1, nume: "Luni" },
  { id: 2, nume: "Marți" },
  { id: 3, nume: "Miercuri" },
  { id: 4, nume: "Joi" },
  { id: 5, nume: "Vineri" },
  { id: 6, nume: "Sâmbătă" },
  { id: 0, nume: "Duminică" },
];

export default function DoctorSchedulePage() {
  const [doctorId, setDoctorId] = useState<string>("");
  const [schedule, setSchedule] = useState<IWorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadDoctorProfile() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (meData.user?.doctorProfileId) {
          const docRes = await fetch(`/api/medici/${meData.user.doctorProfileId}`);
          const docData = await docRes.json();
          if (docData.success && docData.doctor) {
            setDoctorId(docData.doctor._id);

            // Merge with all days of the week
            const existingProgram: IWorkingHours[] = docData.doctor.programLucru || [];
            const completeSchedule: IWorkingHours[] = ZILE.map((z) => {
              const found = existingProgram.find((p) => p.ziuaSaptamanii === z.id);
              if (found) return found;
              return {
                ziuaSaptamanii: z.id,
                activ: z.id >= 1 && z.id <= 5,
                oraInceput: "09:00",
                oraSfarsit: "16:00",
                durataConsultMinute: 30,
              };
            });
            setSchedule(completeSchedule);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorProfile();
  }, []);

  const handleToggleDay = (ziuaId: number) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.ziuaSaptamanii === ziuaId ? { ...item, activ: !item.activ } : item
      )
    );
  };

  const handleTimeChange = (ziuaId: number, field: "oraInceput" | "oraSfarsit" | "durataConsultMinute", value: string | number) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.ziuaSaptamanii === ziuaId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/medici/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programLucru: schedule }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Programul de lucru a fost actualizat cu succes!" });
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la salvare." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de conexiune la salvare." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Se încarcă programul de lucru...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/medic"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurare Program de Consultații</h1>
          <p className="text-xs text-slate-500">
            Definiți zilele lucrătoare, intervalele orare și durata unei consultații pentru generarea automată a sloturilor.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="divide-y divide-slate-100">
          {ZILE.map((zi) => {
            const dayConfig = schedule.find((s) => s.ziuaSaptamanii === zi.id) || {
              ziuaSaptamanii: zi.id,
              activ: false,
              oraInceput: "09:00",
              oraSfarsit: "16:00",
              durataConsultMinute: 30,
            };

            return (
              <div key={zi.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-36">
                  <input
                    type="checkbox"
                    id={`day-${zi.id}`}
                    checked={dayConfig.activ}
                    onChange={() => handleToggleDay(zi.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`day-${zi.id}`} className="font-bold text-sm text-slate-900 cursor-pointer">
                    {zi.nume}
                  </label>
                </div>

                {dayConfig.activ ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">De la:</span>
                      <input
                        type="time"
                        value={dayConfig.oraInceput}
                        onChange={(e) => handleTimeChange(zi.id, "oraInceput", e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Până la:</span>
                      <input
                        type="time"
                        value={dayConfig.oraSfarsit}
                        onChange={(e) => handleTimeChange(zi.id, "oraSfarsit", e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Durată consult:</span>
                      <select
                        value={dayConfig.durataConsultMinute}
                        onChange={(e) => handleTimeChange(zi.id, "durataConsultMinute", Number(e.target.value))}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold"
                      >
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Zi liberă / Cabinet închis</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Se salvează..." : "Salvează Programul"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

