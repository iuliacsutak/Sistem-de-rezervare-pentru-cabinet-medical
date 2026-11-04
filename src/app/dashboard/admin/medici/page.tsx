"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
} from "lucide-react";

interface DoctorItem {
  _id: string;
  titlu: string;
  numarCabinet: string;
  descriere: string;
  userId?: {
    _id: string;
    nume: string;
    email: string;
    telefon: string;
  };
  specializareId?: {
    _id: string;
    denumire: string;
  };
}

interface SpecializationItem {
  _id: string;
  denumire: string;
}

export default function AdminDoctorsPage() {
  const [medici, setMedici] = useState<DoctorItem[]>([]);
  const [specializari, setSpecializari] = useState<SpecializationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Form
  const [form, setForm] = useState({
    nume: "",
    email: "",
    parola: "medic123",
    telefon: "",
    specializareId: "",
    titlu: "Medic Specialist",
    numarCabinet: "Cabinet 101",
    descriere: "",
  });

  // Edit Form (including cabinet assignment)
  const [editingDoctor, setEditingDoctor] = useState<DoctorItem | null>(null);
  const [editForm, setEditForm] = useState({
    nume: "",
    telefon: "",
    specializareId: "",
    titlu: "",
    numarCabinet: "",
    descriere: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, specsRes] = await Promise.all([
        fetch("/api/medici"),
        fetch("/api/specializari"),
      ]);
      const docsData = await docsRes.json();
      const specsData = await specsRes.json();
      setMedici(docsData.medici || []);
      setSpecializari(specsData.specializari || []);
      if (specsData.specializari?.length > 0 && !form.specializareId) {
        setForm((prev) => ({ ...prev, specializareId: specsData.specializari[0]._id }));
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

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/medici", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Medicul a fost adăugat cu succes!" });
        setShowAddModal(false);
        setForm({
          nume: "",
          email: "",
          parola: "medic123",
          telefon: "",
          specializareId: specializari[0]?._id || "",
          titlu: "Medic Specialist",
          numarCabinet: "Cabinet 101",
          descriere: "",
        });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la adăugarea medicului." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de conexiune la adăugare." });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (doctor: DoctorItem) => {
    setEditingDoctor(doctor);
    setEditForm({
      nume: doctor.userId?.nume || "",
      telefon: doctor.userId?.telefon || "",
      specializareId: doctor.specializareId?._id || "",
      titlu: doctor.titlu || "Medic Specialist",
      numarCabinet: doctor.numarCabinet || "Cabinet 1",
      descriere: doctor.descriere || "",
    });
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setSavingEdit(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/medici/${editingDoctor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Cabinetul și datele medicului au fost actualizate cu succes!" });
        setEditingDoctor(null);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.message || "Eroare la actualizarea medicului." });
      }
    } catch {
      setMessage({ type: "error", text: "Eroare de rețea." });
    } finally {
      setSavingEdit(false);
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
            <h1 className="text-2xl font-bold text-slate-900">Gestiune Medici & Cabinete</h1>
            <p className="text-xs text-slate-500">
              Vizualizați medicii, alocați cabinetele dedicate și adăugați cadre medicale noi.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Adaugă Medic Nou</span>
        </button>
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

      {/* Doctors Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Se încarcă lista medicilor...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medici.map((m) => (
            <div
              key={m._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                    {m.specializareId?.denumire || "Fără specializare"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{m.userId?.nume || "Dr."}</h3>
                  <p className="text-xs text-purple-600 font-medium">{m.titlu}</p>
                </div>

                {/* Cabinet Assignment Badge */}
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <span>Locație Cabinet:</span>
                  </div>
                  <span className="font-extrabold bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800">
                    {m.numarCabinet || "Neatribuit"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.userId?.email}</span>
                  </div>
                  {m.userId?.telefon && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.userId.telefon}</span>
                    </div>
                  )}
                </div>

                {m.descriere && (
                  <p className="text-xs text-slate-500 italic pt-1">{m.descriere}</p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => openEditModal(m)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editează Cabinet & Detalii</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Doctor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Adăugare Cont Medic Nou</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nume Complet Medic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dr. Mihai Popa"
                  value={form.nume}
                  onChange={(e) => setForm({ ...form, nume: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Instituțional *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nume@cabinet.ro"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parolă Inițială *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.parola}
                    onChange={(e) => setForm({ ...form, parola: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specializare *
                  </label>
                  <select
                    value={form.specializareId}
                    onChange={(e) => setForm({ ...form, specializareId: e.target.value })}
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
                    Titlu Medical
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Medic Primar"
                    value={form.titlu}
                    onChange={(e) => setForm({ ...form, titlu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cabinet Alocat (ex: Cabinet 101, Sala 2) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cabinet 101"
                    value={form.numarCabinet}
                    onChange={(e) => setForm({ ...form, numarCabinet: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon Contact
                  </label>
                  <input
                    type="text"
                    placeholder="07..."
                    value={form.telefon}
                    onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descriere Scurtă / Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Experiență profesională, competențe..."
                  value={form.descriere}
                  onChange={(e) => setForm({ ...form, descriere: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {saving ? "Se creează contul..." : "Creează Cont Medic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Doctor & Cabinet Assignment */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Editare Medic & Alocare Cabinet</h3>
                <p className="text-xs text-slate-500">{editingDoctor.userId?.email}</p>
              </div>
              <button
                onClick={() => setEditingDoctor(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                <label className="block text-xs font-bold text-amber-900">
                  Număr / Denumire Cabinet Alocat *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.numarCabinet}
                  onChange={(e) => setEditForm({ ...editForm, numarCabinet: e.target.value })}
                  placeholder="ex: Cabinet 101, Cabinet Cardiologie - Etaj 1"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-700">
                  Pacienții vor vedea această denumire de cabinet pe fișa de programare.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nume Complet Medic *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nume}
                  onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specializare *
                  </label>
                  <select
                    value={editForm.specializareId}
                    onChange={(e) => setEditForm({ ...editForm, specializareId: e.target.value })}
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
                    Titlu Medical
                  </label>
                  <input
                    type="text"
                    value={editForm.titlu}
                    onChange={(e) => setEditForm({ ...editForm, titlu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefon Contact
                </label>
                <input
                  type="text"
                  value={editForm.telefon}
                  onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descriere Scurtă / Bio
                </label>
                <textarea
                  rows={2}
                  value={editForm.descriere}
                  onChange={(e) => setEditForm({ ...editForm, descriere: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Se salvează..." : "Salvează Modificările"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
