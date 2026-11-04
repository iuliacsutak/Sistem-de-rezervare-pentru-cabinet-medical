import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Specialization from "@/models/Specialization";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    void User;
    void Specialization;

    const doctor = await Doctor.findById(id)
      .populate("userId", "nume email telefon")
      .populate("specializareId", "denumire icon descriere");

    if (!doctor) {
      return NextResponse.json({ success: false, message: "Medicul nu a fost găsit" }, { status: 404 });
    }

    return NextResponse.json({ success: true, doctor });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error(`/api/medici/[id]`, "Eroare la preluarea medicului", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea medicului" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Medicul nu a fost găsit" }, { status: 404 });
    }

    // Authorization: only the doctor himself or admin
    if (userSession.rol !== "ADMIN" && doctor.userId.toString() !== userSession.userId) {
      await logger.warn(`/api/medici/${id}`, "Tentativă neautorizată de actualizare date medic", {
        solicitatDe: userSession.email,
        medicId: id,
      });
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const body = await request.json();
    const oldCabinet = doctor.numarCabinet;

    if (body.programLucru) {
      doctor.programLucru = body.programLucru;
    }
    if (body.titlu) doctor.titlu = body.titlu;
    if (body.descriere !== undefined) doctor.descriere = body.descriere;
    if (body.numarCabinet) doctor.numarCabinet = body.numarCabinet;
    if (body.pretConsultDefault !== undefined) doctor.pretConsultDefault = body.pretConsultDefault;
    if (body.specializareId && userSession.rol === "ADMIN") {
      doctor.specializareId = body.specializareId;
    }

    if (userSession.rol === "ADMIN" && (body.nume || body.telefon)) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(body.nume ? { nume: body.nume.trim() } : {}),
        ...(body.telefon ? { telefon: body.telefon.trim() } : {}),
      });
    }

    await doctor.save();

    await logger.admin(
      `Date medic actualizate [ID: ${id}] de către ${userSession.nume} (${userSession.rol}) - Cabinet: '${oldCabinet}' -> '${doctor.numarCabinet}'`,
      `/api/medici/${id}`,
      userSession.email,
      {
        medicId: id,
        cabinetNou: doctor.numarCabinet,
        titlu: doctor.titlu,
        modificatProgram: Boolean(body.programLucru),
      }
    );

    return NextResponse.json({ success: true, message: "Datele au fost actualizate", doctor });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error(`/api/medici/[id]`, "Eroare la actualizarea medicului", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la actualizarea medicului" },
      { status: 500 }
    );
  }
}
