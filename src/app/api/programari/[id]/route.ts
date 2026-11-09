import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { creeazaNotificare } from "@/lib/notificari";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      await logger.warn("/api/programari/[id]", "Modificare programare fără autentificare");
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, diagnosticSauObservatii, dataOra } = body;

    await connectToDatabase();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      await logger.warn(`/api/programari/${id}`, "Programarea solicitată nu există", { id });
      return NextResponse.json({ success: false, message: "Programarea nu a fost găsită" }, { status: 404 });
    }

    const oldStatus = appointment.status;

    // Permission checks:
    // Patient can only cancel their own appointment
    if (userSession.rol === "PATIENT") {
      if (appointment.pacientId.toString() !== userSession.userId) {
        await logger.warn(
          `/api/programari/${id}`,
          `Acces refuzat: Pacientul '${userSession.email}' a încercat să modifice programarea altui pacient`
        );
        return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
      }
      if (status && status !== "CANCELLED") {
        return NextResponse.json(
          { success: false, message: "Pacienții pot doar anula programarea" },
          { status: 403 }
        );
      }
    }

    // Doctor can update their own appointments
    if (userSession.rol === "DOCTOR") {
      let doctorId = userSession.doctorProfileId;
      if (!doctorId) {
        const doc = await Doctor.findOne({ userId: userSession.userId });
        if (doc) doctorId = doc._id.toString();
      }
      if (appointment.medicId.toString() !== doctorId) {
        await logger.warn(
          `/api/programari/${id}`,
          `Acces refuzat: Medicul '${userSession.email}' a încercat să modifice programarea altui medic`
        );
        return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
      }
    }
        let reprogramat = false;
    let dataVecheText = "";

    if (dataOra) {
      if (userSession.rol !== "PATIENT") {
        return NextResponse.json(
          { success: false, message: "Doar pacientul poate reprograma." },
          { status: 403 }
        );
      }
      if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
        return NextResponse.json(
          { success: false, message: "Poți reprograma doar programări active." },
          { status: 400 }
        );
      }

      const nouaData = new Date(dataOra);
      if (isNaN(nouaData.getTime()) || nouaData.getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, message: "Data/ora este invalidă sau din trecut." },
          { status: 400 }
        );
      }

      // Același test de conflict ca la creare, dar ignorăm programarea curentă
      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        medicId: appointment.medicId,
        dataOra: nouaData,
        status: { $ne: "CANCELLED" },
      });
      if (conflict) {
        return NextResponse.json(
          { success: false, message: "Intervalul ales nu mai este disponibil." },
          { status: 409 }
        );
      }

      dataVecheText = new Date(appointment.dataOra).toLocaleString("ro-RO");
      appointment.dataOra = nouaData;
      appointment.status = "PENDING"; // medicul trebuie să confirme din nou
      reprogramat = true;
    }

    if (status) {
      appointment.status = status;
    }
    if (diagnosticSauObservatii !== undefined) {
      appointment.diagnosticSauObservatii = diagnosticSauObservatii;
    }

    await appointment.save();

    let actiuneLog = `Status programare [${id}] schimbat din '${oldStatus}' în '${status || oldStatus}' de către ${userSession.nume} (${userSession.rol})`;
    if (status === "CONFIRMED") {
      actiuneLog = `✓ Medicul ${userSession.nume} a CONFIRMAT programarea [${id}]`;
    } else if (status === "CANCELLED") {
      actiuneLog = `✕ Programarea [${id}] a fost RESPINSĂ / ANULATĂ de ${userSession.nume} (${userSession.rol})`;
    } else if (status === "COMPLETED") {
      actiuneLog = `📋 Consultația [${id}] a fost FINALIZATĂ de ${userSession.nume} cu consemnare diagnostic`;
    }

    await logger.programare(actiuneLog, `/api/programari/${id}`, userSession.email, userSession.rol, {
      programareId: id,
      vechiStatus: oldStatus,
      nouStatus: appointment.status,
      areDiagnostic: Boolean(diagnosticSauObservatii),
    });

        if (reprogramat) {
      const medic = await Doctor.findById(appointment.medicId);
      if (medic?.userId) {
        await creeazaNotificare(
          medic.userId.toString(),
          `${userSession.nume} a mutat consultația din ${dataVecheText} pe ${new Date(appointment.dataOra).toLocaleString("ro-RO")}. Așteaptă confirmarea ta.`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Programarea a fost actualizată cu succes!",
      programare: appointment,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error(`/api/programari/[id]`, "Eroare la actualizarea programării", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la actualizarea programării" },
      { status: 500 }
    );
  }
}