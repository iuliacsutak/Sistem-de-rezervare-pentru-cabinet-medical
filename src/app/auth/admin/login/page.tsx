"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, User, Stethoscope } from "lucide-react";

export default function AdminLoginPage() {
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
        body: JSON.stringify({ email, parola, expectedRole: "ADMIN" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Eroare la autentificare.");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/dashboard/admin");
      router.refresh();
    } catch {
      setError("A apărut o problemă de conexiune. Vă rugăm să încercați din nou.");
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@cabinet.ro");
    setParola("admin123");
    setError("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal Administrare
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Acces securizat la panoul central de management al cabinetului
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3.5 text-xs text-purple-200 flex items-center justify-between">
          <div>
            <div className="font-semibold flex items-center gap-1.5 text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Cont administrator demonstrativ:
            </div>
            <div className="text-purple-200 font-mono text-[11px] mt-0.5">
              admin@cabinet.ro / admin123
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
          >
            Completează
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-950/50 border border-red-800 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Administrator
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
                  placeholder="admin@cabinet.ro"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Parolă Securizată
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Se autentifică..." : "Acces Panou Administrator"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              Zonă restricționată. Toate sesiunile de acces sunt înregistrate în conformitate cu normele de securitate.
            </p>
          </div>
        </div>

        {/* Switch Portal Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link
            href="/auth/pacient/login"
            className="hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" /> Portal Pacient
          </Link>
          <span>&bull;</span>
          <Link
            href="/auth/medic/login"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Portal Medic
          </Link>
        </div>
      </div>
    </div>
  );
}

