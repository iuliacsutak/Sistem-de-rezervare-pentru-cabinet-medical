"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Stethoscope,
  User,
  Shield,
  Activity,
  LogOut,
  Calendar,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

interface UserSession {
  id: string;
  nume: string;
  email: string;
  rol: "PATIENT" | "DOCTOR" | "ADMIN";
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const getDashboardUrl = () => {
    if (!user) return "/";
    if (user.rol === "ADMIN") return "/dashboard/admin";
    if (user.rol === "DOCTOR") return "/dashboard/medic";
    return "/dashboard/pacient";
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.rol === "ADMIN")
      return <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Admin</span>;
    if (user.rol === "DOCTOR")
      return <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Medic</span>;
    return <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Pacient</span>;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block">
                Cabinet Medical <span className="text-blue-600">Sănătatea</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block -mt-1 uppercase tracking-wider">
                Sistem Integrat de Programări
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Acasă
            </Link>
            <Link href="/#specializari" className="hover:text-blue-600 transition-colors">
              Specializări
            </Link>
            <Link href="/#medici" className="hover:text-blue-600 transition-colors">
              Medici
            </Link>
            <Link href="/#tarife" className="hover:text-blue-600 transition-colors">
              Tarife & Servicii
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardUrl()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.nume.charAt(0)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user.nume}</p>
                    <div className="flex items-center gap-1">{getRoleBadge()}</div>
                  </div>
                </Link>

                <Link
                  href={getDashboardUrl()}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Panou de Control
                </Link>

                <button
                  onClick={handleLogout}
                  title="Deconectare"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
                >
                  <span>Autentificare Portal</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {loginDropdownOpen && (
                  <div
                    onMouseLeave={() => setLoginDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Alegeți tipul de cont
                    </div>
                    <Link
                      href="/auth/pacient/login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Portal Pacient</div>
                        <div className="text-[10px] text-slate-500">Programări & Istoric</div>
                      </div>
                    </Link>

                    <Link
                      href="/auth/medic/login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Portal Medic</div>
                        <div className="text-[10px] text-slate-500">Agendă & Consultații</div>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-slate-100"></div>

                    <Link
                      href="/auth/admin/login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Portal Administrator</div>
                        <div className="text-[10px] text-slate-500">Gestiune & Statistici</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            Acasă
          </Link>
          <Link
            href="/#specializari"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            Specializări
          </Link>
          <Link
            href="/#medici"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            Medici
          </Link>
          <Link
            href="/#tarife"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            Tarife & Servicii
          </Link>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">Conectat ca {user.nume}</div>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white font-medium text-xs py-2 rounded-lg"
                >
                  Panou de Control
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center bg-red-50 text-red-600 font-medium text-xs py-2 rounded-lg"
                >
                  Deconectare
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Link
                  href="/auth/pacient/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-medium text-xs py-2 rounded-lg"
                >
                  <User className="w-4 h-4" /> Portal Pacient
                </Link>
                <Link
                  href="/auth/medic/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-medium text-xs py-2 rounded-lg"
                >
                  <Activity className="w-4 h-4" /> Portal Medic
                </Link>
                <Link
                  href="/auth/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 font-medium text-xs py-2 rounded-lg"
                >
                  <Shield className="w-4 h-4" /> Portal Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

