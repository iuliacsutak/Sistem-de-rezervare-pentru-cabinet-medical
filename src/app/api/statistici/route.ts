import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    await connectToDatabase();
    void Service;

    const totalPacienti = await User.countDocuments({ rol: "PATIENT" });
    const totalMedici = await Doctor.countDocuments();
    const totalProgramari = await Appointment.countDocuments();

    const programariConfirmate = await Appointment.countDocuments({ status: "CONFIRMED" });
    const programariFinalizate = await Appointment.countDocuments({ status: "COMPLETED" });
    const programariAnulate = await Appointment.countDocuments({ status: "CANCELLED" });
    const programariInAsteptare = await Appointment.countDocuments({ status: "PENDING" });

    // Calculate approximate total earnings from completed appointments
    const completedApps = await Appointment.find({ status: "COMPLETED" }).populate("serviciuId", "pret");
    const venitTotal = completedApps.reduce((acc, curr) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = curr.serviciuId as any;
      return acc + (s?.pret || 0);
    }, 0);

    // Latest 5 appointments
    const ultimeleProgramari = await Appointment.find()
      .populate("pacientId", "nume email telefon")
      .populate({
        path: "medicId",
        populate: [{ path: "userId", select: "nume" }, { path: "specializareId", select: "denumire" }],
      })
      .populate("serviciuId", "denumire pret")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      statistici: {
        totalPacienti,
        totalMedici,
        totalProgramari,
        programariConfirmate,
        programariFinalizate,
        programariAnulate,
        programariInAsteptare,
        venitTotal,
      },
      ultimeleProgramari,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la calcularea statisticilor" },
      { status: 500 }
    );
  }
}

