import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Specialization from "@/models/Specialization";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specializareId = searchParams.get("specializareId");

    await connectToDatabase();
    void User;
    void Specialization;

    const query = specializareId ? { specializareId } : {};

    const medici = await Doctor.find(query)
      .populate("userId", "nume email telefon")
      .populate("specializareId", "denumire icon descriere")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, medici });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/medici", "Eroare la preluarea listei de medici", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea listei de medici" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession || userSession.rol !== "ADMIN") {
      await logger.warn("/api/medici", "Tentativă neautorizată de creare medic nou (non-admin)");
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const body = await request.json();
    const { nume, email, parola, telefon, specializareId, titlu, descriere, numarCabinet, pretConsultDefault } = body;

    if (!nume || !email || !parola || !specializareId) {
      return NextResponse.json(
        { success: false, message: "Numele, emailul, parola și specializarea sunt obligatorii." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      await logger.warn("/api/medici", `Creare medic eșuată: emailul '${email}' există deja`);
      return NextResponse.json(
        { success: false, message: "Un cont cu acest email există deja." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(parola);

    const newUser = await User.create({
      nume: nume.trim(),
      email: email.toLowerCase().trim(),
      parola: hashedPassword,
      telefon: telefon?.trim() || "",
      rol: "DOCTOR",
    });

    const newDoctor = await Doctor.create({
      userId: newUser._id,
      specializareId,
      titlu: titlu || "Medic Specialist",
      descriere: descriere || "",
      numarCabinet: numarCabinet || "Cabinet 101",
      pretConsultDefault: Number(pretConsultDefault) || 150,
      programLucru: [
        { ziuaSaptamanii: 1, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 2, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 3, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 4, activ: true, oraInceput: "09:00", oraSfarsit: "16:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 5, activ: true, oraInceput: "09:00", oraSfarsit: "14:00", durataConsultMinute: 30 },
      ],
    });

    await logger.admin(
      `Administratorul a creat contul de medic pentru '${newUser.nume}' (${newUser.email}) - Locație alocată: '${newDoctor.numarCabinet}'`,
      "/api/medici",
      userSession.email,
      { doctorId: newDoctor._id, cabinet: newDoctor.numarCabinet }
    );

    return NextResponse.json({
      success: true,
      message: "Medicul a fost adăugat cu succes!",
      doctor: newDoctor,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/medici", "Eroare la crearea contului de medic", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la crearea contului de medic" },
      { status: 500 }
    );
  }
}
