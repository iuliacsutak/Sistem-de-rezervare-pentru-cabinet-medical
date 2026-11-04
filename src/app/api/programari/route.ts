import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Service from "@/models/Service";
import Specialization from "@/models/Specialization";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      await logger.warn("/api/programari", "Cerere GET programări neautorizată (fără sesiune)");
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    await connectToDatabase();
    void User;
    void Doctor;
    void Service;
    void Specialization;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let query: Record<string, unknown> = {};

    if (userSession.rol === "PATIENT") {
      query.pacientId = userSession.userId;
    } else if (userSession.rol === "DOCTOR") {
      let doctorId = userSession.doctorProfileId;
      if (!doctorId) {
        const doc = await Doctor.findOne({ userId: userSession.userId });
        if (doc) doctorId = doc._id.toString();
      }
      query.medicId = doctorId;
    } else if (userSession.rol === "ADMIN") {
      const medicId = searchParams.get("medicId");
      const pacientId = searchParams.get("pacientId");
      if (medicId) query.medicId = medicId;
      if (pacientId) query.pacientId = pacientId;
    }

    if (statusFilter && statusFilter !== "ALL") {
      query.status = statusFilter;
    }

    const programari = await Appointment.find(query)
      .populate("pacientId", "nume email telefon cnp")
      .populate({
        path: "medicId",
        populate: [
          { path: "userId", select: "nume email telefon" },
          { path: "specializareId", select: "denumire" },
        ],
      })
      .populate("serviciuId", "denumire pret durataMinute")
      .sort({ dataOra: 1 });

    await logger.programare(
      `Interogare programări de către ${userSession.nume} (${userSession.rol}) - S-au returnat ${programari.length} rezultate`,
      "/api/programari",
      userSession.email,
      userSession.rol,
      { filtruStatus: statusFilter || "TOATE", numarRezultate: programari.length }
    );

    return NextResponse.json({ success: true, programari });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/programari", "Eroare la preluarea programărilor", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea programărilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      await logger.warn("/api/programari", "Tentativă creare programare fără autentificare");
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    const body = await request.json();
    const { medicId, serviciuId, dataOra, motiv, durataMinute } = body;

    let pacientId = userSession.userId;
    if (userSession.rol === "ADMIN" && body.pacientId) {
      pacientId = body.pacientId;
    }

    if (!medicId || !serviciuId || !dataOra) {
      await logger.warn("/api/programari", "Creare programare eșuată: date incomplete", { body });
      return NextResponse.json(
        { success: false, message: "Medicul, serviciul și data/ora sunt obligatorii." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const apptDate = new Date(dataOra);
    if (isNaN(apptDate.getTime())) {
      return NextResponse.json({ success: false, message: "Data/ora este invalidă." }, { status: 400 });
    }

    // Verify slot is not already taken
    const conflict = await Appointment.findOne({
      medicId,
      dataOra: apptDate,
      status: { $ne: "CANCELLED" },
    });

    if (conflict) {
      await logger.warn(
        "/api/programari",
        `Conflict interval orar: Medicul '${medicId}' are deja o programare la data ${apptDate.toISOString()}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Intervalul orar selectat nu mai este disponibil. Vă rugăm să alegeți altă oră.",
        },
        { status: 409 }
      );
    }

    const appointment = await Appointment.create({
      pacientId,
      medicId,
      serviciuId,
      dataOra: apptDate,
      durataMinute: durataMinute || 30,
      status: "PENDING",
      motiv: motiv?.trim() || "",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("pacientId", "nume email telefon")
      .populate({
        path: "medicId",
        populate: [
          { path: "userId", select: "nume email telefon" },
          { path: "specializareId", select: "denumire" },
        ],
      })
      .populate("serviciuId", "denumire pret durataMinute");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pDoc = populatedAppointment?.medicId as any;

    await logger.programare(
      `Programare nouă creată: Pacientul '${userSession.nume}' la Dr. '${pDoc?.userId?.nume}' (${pDoc?.numarCabinet || "Cabinet"}) pe data ${apptDate.toLocaleString("ro-RO")} - Status: PENDING (În așteptare confirmare)`,
      "/api/programari",
      userSession.email,
      userSession.rol,
      {
        programareId: appointment._id,
        dataOra: apptDate,
        medicId,
        serviciuId,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Programarea a fost înregistrată cu succes și este în așteptarea confirmării medicului!",
      programare: populatedAppointment,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/programari", "Eroare la înregistrarea programării", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la crearea programării" },
      { status: 500 }
    );
  }
}
