"use client";

import Link from "next/link";
import { Stethoscope, Heart, Shield, Clock, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">Cabinet Sănătatea</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Platformă modernă dedicată programărilor medicale rapide, gestionării agendei medicilor și evidenței clinice complete.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              Proiect Universitar &bull; Next.js 15 & MongoDB
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Portaluri Acces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/pacient/login" className="hover:text-blue-400 transition-colors">
                  Autentificare Pacienți
                </Link>
              </li>
              <li>
                <Link href="/auth/pacient/register" className="hover:text-blue-400 transition-colors">
                  Înregistrare Pacient Nou
                </Link>
              </li>
              <li>
                <Link href="/auth/medic/login" className="hover:text-emerald-400 transition-colors">
                  Portal Medici & Agendă
                </Link>
              </li>
              <li>
                <Link href="/auth/admin/login" className="hover:text-purple-400 transition-colors">
                  Panou Administrare
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Contact & Locație
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Strada Clinicilor nr. 14, București</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+40 21 000 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>contact@cabinet-sanatatea.ro</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Luni - Vineri: 08:00 - 20:00</span>
              </li>
            </ul>
          </div>

          {/* Demo Credentials quick reference */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Conturi de Test Predefinite:</span>
            </div>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div>
                <strong className="text-white">Admin:</strong> admin@cabinet.ro / admin123
              </div>
              <div>
                <strong className="text-white">Medic:</strong> andrei.ionescu@cabinet.ro / medic123
              </div>
              <div>
                <strong className="text-white">Pacient:</strong> pacient@test.ro / pacient123
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; 2026 Cabinet Medical Sănătatea. Toate drepturile rezervate.</p>

        </div>
      </div>
    </footer>
  );
}
