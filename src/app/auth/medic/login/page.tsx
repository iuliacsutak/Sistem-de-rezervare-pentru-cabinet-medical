"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, parola, expectedRole: "DOCTOR" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Eroare la autentificare.");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/dashboard/medic");
      router.refresh();
    } catch {
      setError("A apărut o problemă de conexiune. Vă rugăm să încercați din nou.");
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("andrei.ionescu@cabinet.ro");
    setParola("medic123");
    setError("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Personal Medical
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Autentificare securizată pentru medicii cabinetului
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
          <div>
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cont medic demonstrativ:
            </div>
            <div className="text-emerald-700 font-mono text-[11px] mt-0.5">
              andrei.ionescu@cabinet.ro / medic123
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
          >
            Completează
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Instituțional Medic
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="medic@cabinet.ro"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Parolă
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Se verifică..." : "Autentificare ca Medic"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Notă: Conturile de medic sunt generate și configurate exclusiv de către Administrator.
            </p>
          </div>
        </div>

        {/* Switch Portal Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span>Sunteți pacient?</span>
          <Link
            href="/auth/pacient/login"
            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" /> Portal Pacient
          </Link>
          <span>&bull;</span>
          <Link href="/auth/admin/login" className="font-medium text-purple-600 hover:underline">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

