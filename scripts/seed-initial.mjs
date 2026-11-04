/**
 * scripts/seed-initial.mjs
 *
 * Script de PRIMA INSTALARE — populează baza de date DOAR dacă este goală.
 * Nu șterge date existente. Folosiți `npm run seed` pentru resetare completă.
 *
 * Utilizare:
 *   npm run db:init          → rulare manuală
 *   (rulat automat după npm install prin "postinstall")
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Citire .env.local manual (nu avem dotenv instalat)
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cabinet_medical";

// ---------------------------------------------------------------------------
// Scheme Mongoose (standalone — fără ts-node)
// ---------------------------------------------------------------------------
const UserSchema = new mongoose.Schema(
  {
    nume: String,
    email: { type: String, unique: true },
    parola: String,
    telefon: String,
    cnp: String,
    rol: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"] },
  },
  { timestamps: true }
);

const SpecializationSchema = new mongoose.Schema(
  {
    denumire: { type: String, unique: true },
    descriere: String,
    icon: String,
  },
  { timestamps: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    specializareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    denumire: String,
    descriere: String,
    pret: Number,
    durataMinute: Number,
  },
  { timestamps: true }
);

const DoctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    specializareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    titlu: String,
    descriere: String,
    numarCabinet: String,
    pretConsultDefault: Number,
    programLucru: Array,
  },
  { timestamps: true }
);

const AppointmentSchema = new mongoose.Schema(
  {
    pacientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    medicId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    serviciuId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    dataOra: Date,
    durataMinute: Number,
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    },
    motiv: String,
    diagnosticSauObservatii: String,
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
const Specialization =
  mongoose.models.Specialization ||
  mongoose.model("Specialization", SpecializationSchema);
const Service =
  mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Doctor =
  mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);

// ---------------------------------------------------------------------------
// Helpers vizuale
// ---------------------------------------------------------------------------
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

const log = {
  info: (msg) => console.log(`${C.cyan}ℹ${C.reset}  ${msg}`),
  ok: (msg) => console.log(`${C.green}✔${C.reset}  ${msg}`),
  warn: (msg) => console.log(`${C.yellow}⚠${C.reset}  ${msg}`),
  err: (msg) => console.log(`${C.red}✖${C.reset}  ${msg}`),
  step: (msg) => console.log(`${C.gray}   ${msg}${C.reset}`),
  line: () => console.log(`${C.gray}${"─".repeat(50)}${C.reset}`),
  title: (msg) =>
    console.log(
      `\n${C.bold}${C.cyan}${"═".repeat(50)}${C.reset}\n${C.bold}  ${msg}${C.reset}\n${C.bold}${C.cyan}${"═".repeat(50)}${C.reset}`
    ),
};

// ---------------------------------------------------------------------------
// Script principal
// ---------------------------------------------------------------------------
async function seedInitial() {
  log.title("🏥  Cabinet Medical — Prima Instalare DB");

  // 1. Conectare
  log.info(`Conectare la MongoDB: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI);
    log.ok("Conexiune stabilită cu succes.");
  } catch (err) {
    log.err("Nu s-a putut conecta la MongoDB!");
    log.err(
      "Verificați că MongoDB rulează local (mongodb://127.0.0.1:27017)."
    );
    console.error(err.message);
    process.exit(1);
  }

  // 2. Verificare date existente
  log.line();
  log.info("Verificare date existente în baza de date...");

  const existingAdmin = await User.findOne({ rol: "ADMIN" });

  if (existingAdmin) {
    log.warn(
      "Baza de date este deja populată (contul de administrator există)."
    );
    log.warn(
      "Nicio modificare nu a fost efectuată."
    );
    log.line();
    console.log(
      `\n${C.yellow}  Dacă doriți să RESETAȚI toate datele, rulați:${C.reset}`
    );
    console.log(`${C.bold}      npm run seed${C.reset}\n`);
    console.log(
      `${C.gray}  ATENȚIE: 'npm run seed' șterge ireversibil toate datele existente!${C.reset}\n`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  log.ok("Baza de date este goală. Începem popularea inițială...");
  log.line();

  // 3. Hashing parole
  const salt = await bcrypt.genSalt(10);
  const hashPass = (p) => bcrypt.hash(p, salt);

  const [hashedAdmin, hashedMedic, hashedPacient] = await Promise.all([
    hashPass("admin123"),
    hashPass("medic123"),
    hashPass("pacient123"),
  ]);

  // 4. Utilizatori de bază
  log.step("Creare cont administrator...");
  const admin = await User.create({
    nume: "Administrator Principal",
    email: "admin@cabinet.ro",
    parola: hashedAdmin,
    telefon: "0720000000",
    rol: "ADMIN",
  });
  log.ok(`Administrator creat: ${admin.email}`);

  log.step("Creare cont pacient de test...");
  const pacient = await User.create({
    nume: "Ion Popescu",
    email: "pacient@test.ro",
    parola: hashedPacient,
    telefon: "0744111222",
    cnp: "1950512123456",
    rol: "PATIENT",
  });
  log.ok(`Pacient creat: ${pacient.email}`);

  // 5. Specializări
  log.line();
  log.step("Creare specializări medicale...");
  const specsData = [
    {
      denumire: "Cardiologie",
      descriere: "Diagnostic și tratament afecțiuni cardiovasculare",
      icon: "HeartPulse",
    },
    {
      denumire: "Dermatologie",
      descriere: "Sănătatea pielii, dermatoscopie și tratamente moderne",
      icon: "Activity",
    },
    {
      denumire: "Pediatrie",
      descriere: "Consultații și controale medicale complete pentru copii",
      icon: "Baby",
    },
    {
      denumire: "Oftalmologie",
      descriere: "Examinare acuitate vizuală și prescripții optice",
      icon: "Eye",
    },
    {
      denumire: "Medicină Generală",
      descriere: "Control de rutină și evaluare generală",
      icon: "Stethoscope",
    },
  ];

  const specDocs = {};
  for (const s of specsData) {
    const doc = await Specialization.create(s);
    specDocs[s.denumire] = doc;
    log.step(`  → Specializare: ${s.denumire}`);
  }
  log.ok(`${specsData.length} specializări create.`);

  // 6. Servicii
  log.line();
  log.step("Creare servicii medicale...");
  const servicesData = [
    { spec: "Cardiologie", denumire: "Consultație Cardiologică", pret: 220, durataMinute: 30 },
    { spec: "Cardiologie", denumire: "EKG cu Interpretare", pret: 100, durataMinute: 20 },
    { spec: "Cardiologie", denumire: "Ecocardiografie", pret: 250, durataMinute: 40 },
    { spec: "Dermatologie", denumire: "Consultație Dermatologică", pret: 190, durataMinute: 30 },
    { spec: "Dermatologie", denumire: "Dermatoscopie Alunițe", pret: 150, durataMinute: 20 },
    { spec: "Pediatrie", denumire: "Consultație Pediatrie", pret: 180, durataMinute: 30 },
    { spec: "Pediatrie", denumire: "Control Pediatrie", pret: 100, durataMinute: 20 },
    { spec: "Oftalmologie", denumire: "Consultație Oftalmologică", pret: 170, durataMinute: 30 },
    { spec: "Oftalmologie", denumire: "Determinare Dioptrii", pret: 80, durataMinute: 15 },
    { spec: "Medicină Generală", denumire: "Consultație Medicină Generală", pret: 140, durataMinute: 30 },
  ];

  const serviceDocs = {};
  for (const s of servicesData) {
    const doc = await Service.create({
      specializareId: specDocs[s.spec]._id,
      denumire: s.denumire,
      pret: s.pret,
      durataMinute: s.durataMinute,
      descriere: `Serviciu medical: ${s.denumire}`,
    });
    serviceDocs[s.denumire] = doc;
  }
  log.ok(`${servicesData.length} servicii create.`);

  // 7. Medici
  log.line();
  log.step("Creare conturi medici...");

  const defaultSchedule = [
    { ziuaSaptamanii: 1, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 2, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 3, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 4, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 5, activ: true, oraInceput: "09:00", oraSfarsit: "14:00", durataConsultMinute: 30 },
  ];

  const doctorsData = [
    {
      nume: "Dr. Andrei Ionescu",
      email: "andrei.ionescu@cabinet.ro",
      telefon: "0721111222",
      spec: "Cardiologie",
      titlu: "Medic Primar Cardiolog",
      numarCabinet: "Cabinet 101",
      descriere: "Peste 15 ani de experiență în cardiologie clinică și ecocardiografie avansată.",
    },
    {
      nume: "Dr. Elena Popa",
      email: "elena.popa@cabinet.ro",
      telefon: "0722222333",
      spec: "Dermatologie",
      titlu: "Medic Specialist Dermatovenerologie",
      numarCabinet: "Cabinet 102",
      descriere: "Specializată în dermatoscopie digitală, tratamente estetice și dermatite.",
    },
    {
      nume: "Dr. Radu Vasilescu",
      email: "radu.vasilescu@cabinet.ro",
      telefon: "0723333444",
      spec: "Pediatrie",
      titlu: "Medic Primar Pediatru",
      numarCabinet: "Cabinet 201",
      descriere: "Empatie și profesionalism în îngrijirea micilor pacienți.",
    },
    {
      nume: "Dr. Maria Dumitrescu",
      email: "maria.dumitrescu@cabinet.ro",
      telefon: "0724444555",
      spec: "Oftalmologie",
      titlu: "Medic Specialist Oftalmolog",
      numarCabinet: "Cabinet 202",
      descriere: "Diagnostic precis al afecțiunilor oculare și prescripții de ochelari.",
    },
  ];

  const createdDoctors = [];
  for (const d of doctorsData) {
    const user = await User.create({
      nume: d.nume,
      email: d.email,
      parola: hashedMedic,
      telefon: d.telefon,
      rol: "DOCTOR",
    });
    const doc = await Doctor.create({
      userId: user._id,
      specializareId: specDocs[d.spec]._id,
      titlu: d.titlu,
      descriere: d.descriere,
      numarCabinet: d.numarCabinet,
      pretConsultDefault: 180,
      programLucru: defaultSchedule,
    });
    createdDoctors.push(doc);
    log.step(`  → ${d.nume} (${d.spec}) — ${d.numarCabinet}`);
  }
  log.ok(`${doctorsData.length} medici creați.`);

  // 8. Programări demonstrative
  log.line();
  log.step("Creare programări de demonstrație...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await Appointment.create({
    pacientId: pacient._id,
    medicId: createdDoctors[0]._id,
    serviciuId: serviceDocs["Consultație Cardiologică"]._id,
    dataOra: tomorrow,
    durataMinute: 30,
    status: "PENDING",
    motiv: "Control periodic tensiune arterială - solicitare nouă",
  });
  log.step("  → Programare PENDING: Ion Popescu → Dr. Andrei Ionescu (Cardiologie)");

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(11, 30, 0, 0);

  await Appointment.create({
    pacientId: pacient._id,
    medicId: createdDoctors[1]._id,
    serviciuId: serviceDocs["Consultație Dermatologică"]._id,
    dataOra: dayAfter,
    durataMinute: 30,
    status: "CONFIRMED",
    motiv: "Examinare aluniță braț stâng",
  });
  log.step("  → Programare CONFIRMED: Ion Popescu → Dr. Elena Popa (Dermatologie)");
  log.ok("2 programări demonstrative create.");

  // 9. Sumar final
  log.line();
  console.log(`\n${C.bold}${C.green}  ✅  Populare inițială finalizată cu succes!${C.reset}\n`);
  console.log(`${C.bold}  DATE DE AUTENTIFICARE:${C.reset}`);
  console.log(`${C.gray}  ─────────────────────────────────────────────${C.reset}`);

  console.log(`\n${C.bold}  ADMINISTRATOR${C.reset}`);
  console.log(`    URL:    ${C.cyan}http://localhost:3000/auth/admin/login${C.reset}`);
  console.log(`    Email:  admin@cabinet.ro`);
  console.log(`    Parolă: ${C.yellow}admin123${C.reset}`);

  console.log(`\n${C.bold}  MEDICI${C.reset} ${C.gray}(parolă comună: medic123)${C.reset}`);
  console.log(`    URL:    ${C.cyan}http://localhost:3000/auth/medic/login${C.reset}`);
  for (const d of doctorsData) {
    console.log(
      `    ${d.nume.padEnd(26)} ${C.gray}${d.email}${C.reset}`
    );
  }

  console.log(`\n${C.bold}  PACIENT DE TEST${C.reset}`);
  console.log(`    URL:    ${C.cyan}http://localhost:3000/auth/pacient/login${C.reset}`);
  console.log(`    Email:  pacient@test.ro`);
  console.log(`    Parolă: ${C.yellow}pacient123${C.reset}`);

  console.log(
    `\n${C.gray}  Resetare completă (ștergere + repopulare): ${C.bold}npm run seed${C.reset}`
  );
  console.log(
    `${C.gray}  Pornire aplicație:                         ${C.bold}npm run dev${C.reset}\n`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seedInitial().catch((err) => {
  console.error(`\n${C.red}✖  Eroare critică la popularea inițială:${C.reset}`, err.message);
  console.error(err);
  process.exit(1);
});

