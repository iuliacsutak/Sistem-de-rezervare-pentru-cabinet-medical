import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Specialization from "@/models/Specialization";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await connectToDatabase();
    const specializari = await Specialization.find().sort({ denumire: 1 });
    return NextResponse.json({ success: true, specializari });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/specializari", "Eroare la preluarea specializărilor", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea specializărilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      await logger.warn("/api/specializari", "Tentativă neautorizată de adăugare specializare");
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.denumire) {
      return NextResponse.json({ success: false, message: "Denumirea este obligatorie" }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Specialization.findOne({ denumire: body.denumire.trim() });
    if (existing) {
      await logger.warn("/api/specializari", `Specializarea '${body.denumire}' există deja`);
      return NextResponse.json({ success: false, message: "Această specializare există deja" }, { status: 409 });
    }

    const nouaSpec = await Specialization.create({
      denumire: body.denumire.trim(),
      descriere: body.descriere?.trim() || "",
      icon: body.icon || "Stethoscope",
    });

    await logger.admin(
      `Specializare nouă creată: '${nouaSpec.denumire}' de către ${user.email}`,
      "/api/specializari",
      user.email,
      { specializareId: nouaSpec._id }
    );

    return NextResponse.json({ success: true, specializare: nouaSpec });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/specializari", "Eroare la crearea specializării", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la crearea specializării" },
      { status: 500 }
    );
  }
}
