import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dataStr = searchParams.get("data"); // format "YYYY-MM-DD"

    if (!dataStr) {
      return NextResponse.json(
        { success: false, message: "Parametrul 'data' (YYYY-MM-DD) este obligatoriu." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Medicul nu a fost găsit" }, { status: 404 });
    }

    // Parse target date
    const targetDate = new Date(`${dataStr}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ success: false, message: "Data este invalidă" }, { status: 400 });
    }

    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const scheduleForDay = doctor.programLucru?.find((p) => p.ziuaSaptamanii === dayOfWeek);

    if (!scheduleForDay || !scheduleForDay.activ) {
      await logger.info(
        `/api/medici/${id}/sloturi`,
        `Verificare orar: Medicul '${doctor.titlu} (${doctor.numarCabinet})' nu are program în ziua ${dayOfWeek}`
      );
      return NextResponse.json({
        success: true,
        mesaj: "Medicul nu are program de consultații în această zi a săptămânii.",
        sloturi: [],
      });
    }

    // Parse start and end times
    const [startH, startM] = scheduleForDay.oraInceput.split(":").map(Number);
    const [endH, endM] = scheduleForDay.oraSfarsit.split(":").map(Number);
    const stepMinutes = scheduleForDay.durataConsultMinute || 30;

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    // Fetch existing appointments on that date (excluding CANCELLED)
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      medicId: id,
      dataOra: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "CANCELLED" },
    });

    const bookedTimes = new Set(
      existingAppointments.map((app) => {
        const d = new Date(app.dataOra);
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      })
    );

    const now = new Date();
    const isToday =
      now.getFullYear() === targetDate.getFullYear() &&
      now.getMonth() === targetDate.getMonth() &&
      now.getDate() === targetDate.getDate();

    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const sloturi = [];
    for (let m = startTotalMinutes; m + stepMinutes <= endTotalMinutes; m += stepMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      let disponibil = !bookedTimes.has(timeStr);

      // If today and time has passed, disable
      if (isToday && m <= nowTotalMinutes + 10) {
        disponibil = false;
      }

      sloturi.push({
        ora: timeStr,
        disponibil,
      });
    }

    const libereCount = sloturi.filter((s) => s.disponibil).length;
    await logger.info(
      `/api/medici/${id}/sloturi`,
      `Calculare sloturi orare: Medicul '${doctor.titlu} (${doctor.numarCabinet})' pe data ${dataStr} -> ${libereCount} sloturi libere din ${sloturi.length} totale`
    );

    return NextResponse.json({
      success: true,
      data: dataStr,
      program: scheduleForDay,
      sloturi,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error(`/api/medici/[id]/sloturi`, "Eroare la calcularea sloturilor orare", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la calcularea intervalelor orare" },
      { status: 500 }
    );
  }
}
