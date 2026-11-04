import { connectToDatabase } from "./mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Specialization from "@/models/Specialization";
import Service from "@/models/Service";
import Appointment from "@/models/Appointment";
import { hashPassword } from "./auth";

export async function runSeed(reset: boolean = false) {
  await connectToDatabase();

  if (reset) {
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await Specialization.deleteMany({});
    await User.deleteMany({});
  }

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: "admin@cabinet.ro" });
  if (existingAdmin && !reset) {
    return { success: true, message: "Baza de date a fost deja populată anterior." };
  }

  const hashedPasswordAdmin = await hashPassword("admin123");
  const hashedPasswordMedic = await hashPassword("medic123");
  const hashedPasswordPacient = await hashPassword("pacient123");

  // 1. Create Admin
  const admin = await User.findOneAndUpdate(
    { email: "admin@cabinet.ro" },
    {
      nume: "Administrator Principal",
      email: "admin@cabinet.ro",
      parola: hashedPasswordAdmin,
      telefon: "0720000000",
      rol: "ADMIN",
    },
    { upsert: true, new: true }
  );

  // 2. Create Test Patient
  const pacient = await User.findOneAndUpdate(
    { email: "pacient@test.ro" },
    {
      nume: "Ion Popescu",
      email: "pacient@test.ro",
      parola: hashedPasswordPacient,
      telefon: "0744111222",
      cnp: "1950512123456",
      rol: "PATIENT",
    },
    { upsert: true, new: true }
  );

  // 3. Create Specializations
  const specializariData = [
    {
      denumire: "Cardiologie",
      descriere: "Diagnostic și tratament pentru afecțiuni cardiace, hipertensiune și investigații EKG.",
      icon: "HeartPulse",
    },
    {
      denumire: "Dermatologie",
      descriere: "Sănătatea pielii, dermatoscopie alunițe, tratament acnee și dermatite.",
      icon: "Activity",
    },
    {
      denumire: "Pediatrie",
      descriere: "Consultații și controale medicale complete pentru copii și sugari.",
      icon: "Baby",
    },
    {
      denumire: "Oftalmologie",
      descriere: "Examinare acuitate vizuală, prescripții ochelari și lentile de contact.",
      icon: "Eye",
    },
    {
      denumire: "Medicină Generală",
      descriere: "Control de rutină, adeverințe medicale și evaluare generală a sănătății.",
      icon: "Stethoscope",
    },
  ];

  const specMap: Record<string, string> = {};
  for (const item of specializariData) {
    let spec = await Specialization.findOne({ denumire: item.denumire });
    if (!spec) {
      spec = await Specialization.create(item);
    }
    specMap[item.denumire] = spec._id.toString();
  }

  // 4. Create Services
  const serviciiData = [
    { spec: "Cardiologie", denumire: "Consultație Cardiologică", pret: 220, durataMinute: 30 },
    { spec: "Cardiologie", denumire: "EKG cu Interpretare", pret: 100, durataMinute: 20 },
    { spec: "Cardiologie", denumire: "Ecocardiografie", pret: 250, durataMinute: 40 },

    { spec: "Dermatologie", denumire: "Consultație Dermatologică", pret: 190, durataMinute: 30 },
    { spec: "Dermatologie", denumire: "Dermatoscopie (până la 5 leziuni)", pret: 150, durataMinute: 20 },

    { spec: "Pediatrie", denumire: "Consultație Pediatrie", pret: 180, durataMinute: 30 },
    { spec: "Pediatrie", denumire: "Control Pediatrie (în 14 zile)", pret: 100, durataMinute: 20 },

    { spec: "Oftalmologie", denumire: "Consultație Oftalmologică Completă", pret: 170, durataMinute: 30 },
    { spec: "Oftalmologie", denumire: "Determinare Dioptrii", pret: 80, durataMinute: 15 },

    { spec: "Medicină Generală", denumire: "Consultație Medicină Generală", pret: 140, durataMinute: 30 },
    { spec: "Medicină Generală", denumire: "Eliberare Adeverință / Aviz", pret: 60, durataMinute: 15 },
  ];

  const serviceMap: Record<string, string> = {};
  for (const serv of serviciiData) {
    const specId = specMap[serv.spec];
    if (specId) {
      let s = await Service.findOne({ denumire: serv.denumire, specializareId: specId });
      if (!s) {
        s = await Service.create({
          specializareId: specId,
          denumire: serv.denumire,
          pret: serv.pret,
          durataMinute: serv.durataMinute,
          descriere: `Serviciu medical de specialitate: ${serv.denumire}`,
        });
      }
      serviceMap[serv.denumire] = s._id.toString();
    }
  }

  // 5. Create Doctors
  const doctorsData = [
    {
      nume: "Dr. Andrei Ionescu",
      email: "andrei.ionescu@cabinet.ro",
      telefon: "0721111222",
      specializare: "Cardiologie",
      titlu: "Medic Primar Cardiolog",
      numarCabinet: "Cabinet 101",
      descriere: "Peste 15 ani de experiență în cardiologie clinică și ecocardiografie avansată.",
    },
    {
      nume: "Dr. Elena Popa",
      email: "elena.popa@cabinet.ro",
      telefon: "0722222333",
      specializare: "Dermatologie",
      titlu: "Medic Specialist Dermatovenerologie",
      numarCabinet: "Cabinet 102",
      descriere: "Specializată în dermatoscopie digitală, tratamente estetice și dermatite cronice.",
    },
    {
      nume: "Dr. Radu Vasilescu",
      email: "radu.vasilescu@cabinet.ro",
      telefon: "0723333444",
      specializare: "Pediatrie",
      titlu: "Medic Primar Pediatru",
      numarCabinet: "Cabinet 201",
      descriere: "Empatie și profesionalism în îngrijirea copiilor de la nou-născut până la adolescență.",
    },
    {
      nume: "Dr. Maria Dumitrescu",
      email: "maria.dumitrescu@cabinet.ro",
      telefon: "0724444555",
      specializare: "Oftalmologie",
      titlu: "Medic Specialist Oftalmolog",
      numarCabinet: "Cabinet 202",
      descriere: "Diagnostic precis al viciilor de refracție și al afecțiunilor retiniene.",
    },
  ];

  const defaultSchedule = [
    { ziuaSaptamanii: 1, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 2, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 3, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 4, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
    { ziuaSaptamanii: 5, activ: true, oraInceput: "09:00", oraSfarsit: "14:00", durataConsultMinute: 30 },
  ];

  const createdDoctors = [];

  for (const doc of doctorsData) {
    let user = await User.findOne({ email: doc.email });
    if (!user) {
      user = await User.create({
        nume: doc.nume,
        email: doc.email,
        parola: hashedPasswordMedic,
        telefon: doc.telefon,
        rol: "DOCTOR",
      });
    }

    const specId = specMap[doc.specializare];
    let doctorDoc = await Doctor.findOne({ userId: user._id });
    if (!doctorDoc) {
      doctorDoc = await Doctor.create({
        userId: user._id,
        specializareId: specId,
        titlu: doc.titlu,
        descriere: doc.descriere,
        numarCabinet: doc.numarCabinet,
        programLucru: defaultSchedule,
      });
    }
    createdDoctors.push({ doctorDoc, user });
  }

  // 6. Create sample appointments for demo (one PENDING, one CONFIRMED)
  const sampleDoctor1 = createdDoctors[0]?.doctorDoc;
  const sampleDoctor2 = createdDoctors[1]?.doctorDoc;
  const sampleServiceCardio = serviceMap["Consultație Cardiologică"];
  const sampleServiceDermo = serviceMap["Consultație Dermatologică"];

  if (pacient && sampleDoctor1 && sampleServiceCardio) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await Appointment.create({
      pacientId: pacient._id,
      medicId: sampleDoctor1._id,
      serviciuId: sampleServiceCardio,
      dataOra: tomorrow,
      durataMinute: 30,
      status: "PENDING",
      motiv: "Control periodic tensiune arterială - solicitare în așteptare",
    });
  }

  if (pacient && sampleDoctor2 && sampleServiceDermo) {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(11, 30, 0, 0);

    await Appointment.create({
      pacientId: pacient._id,
      medicId: sampleDoctor2._id,
      serviciuId: sampleServiceDermo,
      dataOra: dayAfter,
      durataMinute: 30,
      status: "CONFIRMED",
      motiv: "Examinare aluniță braț",
    });
  }

  return {
    success: true,
    message: "Datele inițiale au fost inserate cu succes în MongoDB!",
    conturi: {
      admin: { email: "admin@cabinet.ro", parola: "admin123" },
      medici: doctorsData.map((d) => ({ nume: d.nume, email: d.email, parola: "medic123", spec: d.specializare })),
      pacient: { email: "pacient@test.ro", parola: "pacient123" },
    },
  };
}
