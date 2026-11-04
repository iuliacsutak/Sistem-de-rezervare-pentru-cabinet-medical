import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cabinet_medical";

// Define Schemas directly in the script for standalone execution without ts-node
const UserSchema = new mongoose.Schema({
  nume: String,
  email: { type: String, unique: true },
  parola: String,
  telefon: String,
  cnp: String,
  rol: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"] },
}, { timestamps: true });

const SpecializationSchema = new mongoose.Schema({
  denumire: { type: String, unique: true },
  descriere: String,
  icon: String,
}, { timestamps: true });

const ServiceSchema = new mongoose.Schema({
  specializareId: { type: mongoose.Schema.Types.ObjectId, ref: "Specialization" },
  denumire: String,
  descriere: String,
  pret: Number,
  durataMinute: Number,
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  specializareId: { type: mongoose.Schema.Types.ObjectId, ref: "Specialization" },
  titlu: String,
  descriere: String,
  numarCabinet: String,
  pretConsultDefault: Number,
  programLucru: Array,
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  pacientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  medicId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  serviciuId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  dataOra: Date,
  durataMinute: Number,
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] },
  motiv: String,
  diagnosticSauObservatii: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Specialization = mongoose.models.Specialization || mongoose.model("Specialization", SpecializationSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);

async function seed() {
  console.log("Conectare la MongoDB...", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Conectat cu succes!");

  console.log("Curățare colecții vechi...");
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await Service.deleteMany({});
  await Specialization.deleteMany({});
  await User.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashPass = async (p) => bcrypt.hash(p, salt);

  const hashedPasswordAdmin = await hashPass("admin123");
  const hashedPasswordMedic = await hashPass("medic123");
  const hashedPasswordPacient = await hashPass("pacient123");

  console.log("Creare utilizatori de bază...");
  const admin = await User.create({
    nume: "Administrator Principal",
    email: "admin@cabinet.ro",
    parola: hashedPasswordAdmin,
    telefon: "0720000000",
    rol: "ADMIN",
  });

  const pacient = await User.create({
    nume: "Ion Popescu",
    email: "pacient@test.ro",
    parola: hashedPasswordPacient,
    telefon: "0744111222",
    cnp: "1950512123456",
    rol: "PATIENT",
  });

  console.log("Creare specializări...");
  const specs = [
    { denumire: "Cardiologie", descriere: "Diagnostic și tratament afecțiuni cardiovasculare", icon: "HeartPulse" },
    { denumire: "Dermatologie", descriere: "Sănătatea pielii, dermatoscopie și tratamente moderne", icon: "Activity" },
    { denumire: "Pediatrie", descriere: "Consultații și controale medicale complete pentru copii", icon: "Baby" },
    { denumire: "Oftalmologie", descriere: "Examinare acuitate vizuală și prescripții optice", icon: "Eye" },
    { denumire: "Medicină Generală", descriere: "Control de rutină și evaluare generală", icon: "Stethoscope" },
  ];

  const specDocs = {};
  for (const s of specs) {
    const doc = await Specialization.create(s);
    specDocs[s.denumire] = doc;
  }

  console.log("Creare servicii medicale...");
  const services = [
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
  for (const s of services) {
    const doc = await Service.create({
      specializareId: specDocs[s.spec]._id,
      denumire: s.denumire,
      pret: s.pret,
      durataMinute: s.durataMinute,
      descriere: `Serviciu medical: ${s.denumire}`,
    });
    serviceDocs[s.denumire] = doc;
  }

  console.log("Creare medici...");
  const defaultSchedule = [
    { ziuaSaptamanii: 1, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 2, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 3, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 4, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 5, activ: true, oraInceput: "09:00", oraSfarsit: "14:00", durataConsultMinute: 30 },
  ];

  const doctors = [
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
  for (const d of doctors) {
    const user = await User.create({
      nume: d.nume,
      email: d.email,
      parola: hashedPasswordMedic,
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
  }

  console.log("Creare programări demonstrative...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  // 1. O programare în așteptare pentru testarea confirmării de către medic
  await Appointment.create({
    pacientId: pacient._id,
    medicId: createdDoctors[0]._id,
    serviciuId: serviceDocs["Consultație Cardiologică"]._id,
    dataOra: tomorrow,
    durataMinute: 30,
    status: "PENDING",
    motiv: "Control periodic tensiune arterială - solicitare nouă",
  });

  // 2. O programare confirmată pentru testarea fișei de consultație
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(11, 30, 0, 0);

  await Appointment.create({
    pacientId: pacient._id,
    medicId: createdDoctors[1]._id, // Dr. Elena Popa (Dermatologie)
    serviciuId: serviceDocs["Consultație Dermatologică"]._id,
    dataOra: dayAfter,
    durataMinute: 30,
    status: "CONFIRMED",
    motiv: "Examinare aluniță braț stâng",
  });

  console.log("\n==============================================");
  console.log("✅ Populare reușită! Date de autentificare:");
  console.log("----------------------------------------------");
  console.log("ADMINISTRATOR:");
  console.log("  Email:  admin@cabinet.ro");
  console.log("  Parolă: admin123");
  console.log("MEDICI:");
  doctors.forEach((d) => {
    console.log(`  ${d.nume} (${d.spec}): ${d.email} / medic123`);
  });
  console.log("PACIENT:");
  console.log("  Email:  pacient@test.ro");
  console.log("  Parolă: pacient123");
  console.log("==============================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Eroare la populare:", err);
  process.exit(1);
});
