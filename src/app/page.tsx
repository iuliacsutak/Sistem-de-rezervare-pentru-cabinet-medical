import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Clock,
  Shield,
  User,
  Activity,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Baby,
  Eye,
  Award,
  Sparkles,
} from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import Specialization from "@/models/Specialization";
import Doctor from "@/models/Doctor";
import Service from "@/models/Service";
import UserModal from "@/models/User";

import { connection } from "next/server";

export const instant = false;

// Home page component
export default async function HomePage() {
  await connection();
  await connectToDatabase();
  void UserModal;

  const specializari = await Specialization.find().lean();
  const medici = await Doctor.find()
    .populate("userId", "nume email telefon")
    .populate("specializareId", "denumire icon descriere")
    .lean();
  const servicii = await Service.find().populate("specializareId", "denumire").lean();

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "HeartPulse":
        return <HeartPulse className="w-6 h-6 text-red-500" />;
      case "Baby":
        return <Baby className="w-6 h-6 text-pink-500" />;
      case "Eye":
        return <Eye className="w-6 h-6 text-indigo-500" />;
      case "Activity":
        return <Activity className="w-6 h-6 text-emerald-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Programări Medicale Online &bull; Simplu și Rapid</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Sănătatea ta este{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  prioritatea noastră.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Rezervă o consultație la medicii specialiști ai cabinetului în doar câteva secunde.
                Alege data și intervalul orar disponibil fără așteptare la telefon.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard/pacient/programeaza"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Programează o Consultație</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/auth/pacient/login"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Autentificare Pacient</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-black text-slate-900">{medici.length}+</div>
                  <div className="text-xs text-slate-500 font-medium">Medici Specialiști</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{specializari.length}</div>
                  <div className="text-xs text-slate-500 font-medium">Specializări Clinice</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Rezervare Digitală</div>
                </div>
              </div>
            </div>

            {/* Right Column: Portal Access Quick Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Acces Rapid pe Roluri
              </div>

              {/* Card 1: Pacient */}
              <Link
                href="/auth/pacient/login"
                className="group block p-4 bg-white rounded-2xl border border-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        Portal Pacienți
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Programare online, vizualizare orar medici, istoric consultații.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Card 2: Medic */}
              <Link
                href="/auth/medic/login"
                className="group block p-4 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                        Portal Personal Medical
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agendă zilnică de consultații, diagnostic și configurare orar.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Card 3: Administrator */}
              <Link
                href="/auth/admin/login"
                className="group block p-4 bg-white rounded-2xl border border-purple-100 hover:border-purple-400 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                        Portal Administrator
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gestiune medici, configurare tarife/servicii, statistici clinice.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specializări Section */}
      <section id="specializari" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Departamente Medicale
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900">
            Specializările Disponibile în Cabinet
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Servicii medicale de diagnostic și tratament realizate cu echipamente performante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializari.map((spec) => (
            <div
              key={spec._id.toString()}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {getIcon(spec.icon)}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{spec.denumire}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{spec.descriere}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/pacient/programeaza?specializareId=${spec._id.toString()}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Programează la {spec.denumire} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medici Section */}
      <section id="medici" className="bg-slate-100/60 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Echipa Noastră
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Medici Specialiști</h3>
            <p className="mt-2 text-sm text-slate-600">
              Personal medical dedicat sănătății dumneavoastră, cu experiență clinică solidă.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {medici.map((medic) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const userObj = medic.userId as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const specObj = medic.specializareId as any;

              return (
                <div
                  key={medic._id.toString()}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mb-4 mx-auto">
                      {userObj?.nume
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2) || "Dr"}
                    </div>

                    <div className="text-center mb-4">
                      <h4 className="font-bold text-slate-900 text-base">{userObj?.nume}</h4>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">
                        {medic.titlu || "Medic Specialist"}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium">
                        {specObj?.denumire}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 text-center leading-relaxed line-clamp-3 mb-4">
                      {medic.descriere || "Consultații de specialitate și investigații dedicate."}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Locație: {medic.numarCabinet || "Cabinet 1"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Luni - Vineri: 09:00 - 16:00</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/pacient/programeaza?medicId=${medic._id.toString()}`}
                    className="mt-6 w-full py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Alege Medicul</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tarife și Servicii Section */}
      <section id="tarife" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Transparență Totală
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900">Tarife Servicii Medicale</h3>
          <p className="mt-2 text-sm text-slate-600">
            Lista serviciilor clinice și a duratelor estimate pentru fiecare consultație.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {servicii.map((serv) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const spec = serv.specializareId as any;
              return (
                <div
                  key={serv._id.toString()}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{serv.denumire}</span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {spec?.denumire || "General"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Durată estimată: {serv.durataMinute} minute &bull; Include examinare și recomandări
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">{serv.pret} RON</div>
                    <Link
                      href={`/dashboard/pacient/programeaza?serviciuId=${serv._id.toString()}`}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Rezervă acum &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cum Funcționează Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              Fluxul de Rezervare
            </h2>
            <h3 className="text-3xl font-extrabold text-white">Cum funcționează sistemul?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h4 className="text-base font-bold text-white">Alegeți Medicul și Serviciul</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selectați specialitatea dorită și medicul specialist în funcție de nevoile dumneavoastră medicale.
              </p>
            </div>

            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h4 className="text-base font-bold text-white">Alegeți Intervalul Liber</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistemul afișează în timp real doar sloturile orare libere, prevenind suprapunerile de programare.
              </p>
            </div>

            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h4 className="text-base font-bold text-white">Confirmare Instantanee</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Programarea este salvată imediat în baza de date și apare pe agenda medicului și în contul dvs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
