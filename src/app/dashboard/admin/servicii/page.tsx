"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Layers,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SpecializationItem {
  _id: string;
  denumire: string;
  descriere?: string;
}

interface ServiceItem {
  _id: string;
  denumire: string;
  pret: number;
  durataMinute: number;
  specializareId?: {
    _id: string;
    denumire: string;
  };
}

export default function AdminServicesPage() {
  const [specializari, setSpecializari] = useState<SpecializationItem[]>([]);
  const [servicii, setServicii] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Spec Form
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [savingSpec, setSavingSpec] = useState(false);

  // New Service Form
  const [servForm, setServForm] = useState({
    specializareId: "",
    denumire: "",
    pret: 150,
    durataMinute: 30,
  });
  const [savingServ, setSavingServ] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [specRes, servRes] = await Promise.all([
        fetch("/api/specializari"),
        fetch("/api/servicii"),
      ]);
      const specData = await specRes.json();
      const servData = await servRes.json();
      setSpecializari(specData.specializari || []);
      setServicii(servData.servicii || []);
      if (specData.specializari?.length > 0 && !servForm.specializareId) {
        setServForm((prev) => ({ ...prev, specializareId: specData.specializari[0]._id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName) return;
    setSavingSpec(true);
    setMessage(null);

    try {
      const res = await fetch("/api/specializari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denumire: newSpecName, descriere: newSpecDesc }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Specializarea a fost adăugată!" });
        setNewSpecName("");
        setNewSpecDesc("");
        fetchData();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la salvare." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de rețea." });
    } finally {
      setSavingSpec(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servForm.denumire || !servForm.specializareId) return;
    setSavingServ(true);
    setMessage(null);

    try {
      const res = await fetch("/api/servicii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(servForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Serviciul medical a fost adăugat!" });
        setServForm((prev) => ({ ...prev, denumire: "", pret: 150 }));
        fetchData();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la salvare." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de rețea." });
    } finally {
      setSavingServ(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Sigur doriți să ștergeți acest serviciu medical?")) return;
    try {
      const res = await fetch(`/api/servicii/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Serviciul a fost șters." });
        fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "Eroare la ștergere." });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestiune Servicii & Specializări</h1>
          <p className="text-xs text-slate-500">
            Configurare departamente clinice, nomenclator de servicii și prețuri.
          </p>
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

      {/* Grid: Add Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Add Specialization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Adaugă Specializare Nouă</h3>
          </div>

          <form onSubmit={handleAddSpec} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Denumire Secție / Specialitate *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Neurologie, Ortopedie..."
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descriere Scurtă
              </label>
              <input
                type="text"
                placeholder="Descriere afișată pacienților pe prima pagină"
                value={newSpecDesc}
                onChange={(e) => setNewSpecDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={savingSpec}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingSpec ? "Se salvează..." : "Adaugă Specializarea"}
            </button>
          </form>
        </div>

        {/* Form 2: Add Service */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Adaugă Serviciu Medical & Tarif</h3>
          </div>

          <form onSubmit={handleAddService} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specializare Părinte *
              </label>
              <select
                value={servForm.specializareId}
                onChange={(e) => setServForm({ ...servForm, specializareId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              >
                {specializari.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.denumire}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Denumire Serviciu *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Ecografie Abdominală"
                value={servForm.denumire}
                onChange={(e) => setServForm({ ...servForm, denumire: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preț (RON) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={servForm.pret}
                  onChange={(e) => setServForm({ ...servForm, pret: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durată (minute)
                </label>
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={servForm.durataMinute}
                  onChange={(e) => setServForm({ ...servForm, durataMinute: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingServ}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingServ ? "Se salvează..." : "Adaugă Serviciul"}
            </button>
          </form>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Lista Serviciilor Medicale Active</h3>
          <p className="text-xs text-slate-500">Tarifele și timpii alocați consultațiilor</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Specializare</th>
                <th className="py-3 px-4 font-semibold">Denumire Serviciu</th>
                <th className="py-3 px-4 font-semibold">Durată</th>
                <th className="py-3 px-4 font-semibold">Preț</th>
                <th className="py-3 px-4 font-semibold text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicii.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-blue-700">
                    {s.specializareId?.denumire || "General"}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{s.denumire}</td>
                  <td className="py-3 px-4 text-slate-600">{s.durataMinute} min</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{s.pret} RON</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteService(s._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

