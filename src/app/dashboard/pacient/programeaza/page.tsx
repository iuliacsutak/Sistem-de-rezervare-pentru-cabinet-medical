"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";

interface SpecializationItem {
  _id: string;
  denumire: string;
  descriere?: string;
  icon?: string;
}

interface DoctorItem {
  _id: string;
  titlu: string;
  numarCabinet: string;
  descriere: string;
  userId: {
    _id: string;
    nume: string;
    email: string;
    telefon: string;
  };
  specializareId: {
    _id: string;
    denumire: string;
  };
}

interface ServiceItem {
  _id: string;
  denumire: string;
  pret: number;
  durataMinute: number;
  descriere?: string;
  specializareId: string | { _id: string; denumire: string };
}

interface SlotItem {
  ora: string;
  disponibil: boolean;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSpecId = searchParams.get("specializareId") || "";
  const initialDoctorId = searchParams.get("medicId") || "";
  const initialServiceId = searchParams.get("serviciuId") || "";

  const [specializari, setSpecializari] = useState<SpecializationItem[]>([]);
  const [medici, setMedici] = useState<DoctorItem[]>([]);
  const [servicii, setServicii] = useState<ServiceItem[]>([]);

  // Selected State
  const [selectedSpecializareId, setSelectedSpecializareId] = useState<string>(initialSpecId);
  const [selectedMedicId, setSelectedMedicId] = useState<string>(initialDoctorId);
  const [selectedServiciuId, setSelectedServiciuId] = useState<string>(initialServiceId);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [motiv, setMotiv] = useState<string>("");

  // Slots loading state
  const [sloturi, setSloturi] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsMessage, setSlotsMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // 1. Initial Load of Specializări, Medici, Servicii
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setMinDate(today);
    setSelectedDate(tomorrow);

    async function initData() {
      try {
        const [specsRes, docsRes, servRes] = await Promise.all([
          fetch("/api/specializari"),
          fetch("/api/medici"),
          fetch("/api/servicii"),
        ]);

        const specsData = await specsRes.json();
        const docsData = await docsRes.json();
        const servData = await servRes.json();

        setSpecializari(specsData.specializari || []);
        setMedici(docsData.medici || []);
        setServicii(servData.servicii || []);

        // Auto-select if medic was preselected from URL
        if (initialDoctorId) {
          const doc = (docsData.medici || []).find((d: DoctorItem) => d._id === initialDoctorId);
          if (doc && doc.specializareId) {
            setSelectedSpecializareId(
              typeof doc.specializareId === "string" ? doc.specializareId : doc.specializareId._id
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [initialDoctorId]);

  // 2. Fetch available slots when Doctor or Date changes
  useEffect(() => {
    if (!selectedMedicId || !selectedDate) {
      setSloturi([]);
      setSlotsMessage("");
      return;
    }

    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot("");
      setSlotsMessage("");

      try {
        const res = await fetch(`/api/medici/${selectedMedicId}/sloturi?data=${selectedDate}`);
        const data = await res.json();

        if (data.success) {
          setSloturi(data.sloturi || []);
          if (data.mesaj) {
            setSlotsMessage(data.mesaj);
          } else if (data.sloturi?.length === 0) {
            setSlotsMessage("Nu există intervale orare configurate pentru această zi.");
          }
        } else {
          setSlotsMessage(data.message || "Eroare la preluarea orelor disponibile.");
        }
      } catch {
        setSlotsMessage("Eroare de conexiune la preluarea orelor.");
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedMedicId, selectedDate]);

  // Filtered doctors based on selected specialization
  const filteredMedici = selectedSpecializareId
    ? medici.filter((m) => {
        const specId = typeof m.specializareId === "string" ? m.specializareId : m.specializareId?._id;
        return specId === selectedSpecializareId;
      })
    : medici;

  // Filtered services based on selected specialization
  const filteredServicii = selectedSpecializareId
    ? servicii.filter((s) => {
        const sSpecId = typeof s.specializareId === "string" ? s.specializareId : s.specializareId?._id;
        return sSpecId === selectedSpecializareId;
      })
    : servicii;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedMedicId) {
      setError("Vă rugăm să selectați medicul.");
      return;
    }
    if (!selectedServiciuId) {
      setError("Vă rugăm să selectați serviciul medical.");
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setError("Vă rugăm să alegeți data și ora consultației.");
      return;
    }

    setSubmitting(true);

    try {
      const fullDateTime = `${selectedDate}T${selectedSlot}:00`;
      const res = await fetch("/api/programari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicId: selectedMedicId,
          serviciuId: selectedServiciuId,
          dataOra: fullDateTime,
          motiv,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Eroare la înregistrarea programării.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/pacient");
      }, 2000);
    } catch {
      setError("A apărut o problemă de conexiune. Vă rugăm să încercați din nou.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Se inițializează formularul de programare...
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-2xl border border-emerald-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Programare Confirmată!</h2>
        <p className="text-xs text-slate-600">
          Consultația dumneavoastră a fost înregistrată cu succes în sistem. Vă redirecționăm către panoul dumneavoastră...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/pacient"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programare Consultație Nouă</h1>
          <p className="text-xs text-slate-500">
            Completați pașii de mai jos pentru a rezerva locul dorit în cabinet.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-6">
        {/* Step 1: Specializare */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Alegeți Specializarea Medicală</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {specializari.map((spec) => {
              const isSelected = selectedSpecializareId === spec._id;
              return (
                <button
                  type="button"
                  key={spec._id}
                  onClick={() => {
                    setSelectedSpecializareId(spec._id);
                    setSelectedMedicId("");
                    setSelectedServiciuId("");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold block">{spec.denumire}</span>
                  {isSelected && <span className="text-[10px] text-blue-600 font-semibold mt-1">✓ Selectat</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Medic */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Alegeți Medicul Specialist</h3>
          </div>

          {filteredMedici.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Nu a fost găsit niciun medic disponibil pentru această specializare.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMedici.map((m) => {
                const isSelected = selectedMedicId === m._id;
                return (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => {
                      setSelectedMedicId(m._id);
                      const sId = typeof m.specializareId === "string" ? m.specializareId : m.specializareId?._id;
                      if (sId) setSelectedSpecializareId(sId);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{m.userId?.nume}</h4>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {m.specializareId?.denumire}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{m.titlu || "Medic Specialist"}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 w-fit border border-amber-200">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>Locație: {m.numarCabinet || "Cabinet 1"}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 3: Serviciu Medical */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Alegeți Serviciul Medical</h3>
          </div>

          {filteredServicii.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Selectați o specializare pentru a vedea serviciile.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServicii.map((s) => {
                const isSelected = selectedServiciuId === s._id;
                return (
                  <button
                    type="button"
                    key={s._id}
                    onClick={() => setSelectedServiciuId(s._id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{s.denumire}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{s.durataMinute} minute</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900">{s.pret} RON</span>
                      {isSelected && <span className="block text-[10px] text-blue-600 font-semibold">Selectat</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 4: Data & Ora (Sloturi libere) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Selectați Data și Intervalul Orar Liber</h3>
          </div>

          {/* Date Picker Input */}
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data Consultației (Luni - Vineri)
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Slots View */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">Ore Disponibile:</div>

            {!selectedMedicId ? (
              <p className="text-xs text-slate-400 italic">
                Alegeți mai întâi medicul pentru a vizualiza programul acestuia.
              </p>
            ) : loadingSlots ? (
              <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
                <Clock className="w-4 h-4 animate-spin text-blue-600" />
                <span>Se verifică disponibilitatea intervalelor orare...</span>
              </div>
            ) : sloturi.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                {slotsMessage || "Nu sunt consultații disponibile în această zi. Vă rugăm să alegeți altă dată."}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {sloturi.map((slot) => {
                  const isSelected = selectedSlot === slot.ora;
                  return (
                    <button
                      type="button"
                      key={slot.ora}
                      disabled={!slot.disponibil}
                      onClick={() => setSelectedSlot(slot.ora)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        !slot.disponibil
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs cursor-pointer"
                          : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 cursor-pointer"
                      }`}
                    >
                      {slot.ora}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Motiv & Confirmare */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              5
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Motiv Programare & Detalii Suplimentare</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrieți pe scurt motivul vizitei (opțional)
            </label>
            <textarea
              rows={2}
              value={motiv}
              onChange={(e) => setMotiv(e.target.value)}
              placeholder="ex: Dureri de cap recurente, control periodic sau eliberare adeverință..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {selectedSlot ? (
                <span className="text-slate-800 font-semibold">
                  Dată selectată: {selectedDate} la ora {selectedSlot}
                </span>
              ) : (
                "Alegeți o oră pentru a activa butonul de finalizare."
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? "Se înregistrează..." : "Confirmă Programarea"}
              {!submitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
          Se încarcă pagina de programare...
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
