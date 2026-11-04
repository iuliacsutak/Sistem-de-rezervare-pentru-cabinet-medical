import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Service from "@/models/Service";
import Specialization from "@/models/Specialization";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specializareId = searchParams.get("specializareId");

    await connectToDatabase();
    void Specialization;

    const query = specializareId ? { specializareId } : {};
    const servicii = await Service.find(query)
      .populate("specializareId", "denumire")
      .sort({ denumire: 1 });

    return NextResponse.json({ success: true, servicii });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/servicii", "Eroare la preluarea serviciilor", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea serviciilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      await logger.warn("/api/servicii", "Tentativă neautorizată de adăugare serviciu medical");
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const body = await request.json();
    const { specializareId, denumire, descriere, pret, durataMinute } = body;

    if (!specializareId || !denumire || pret === undefined) {
      return NextResponse.json(
        { success: false, message: "Toate câmpurile obligatorii trebuie completate" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const nouServiciu = await Service.create({
      specializareId,
      denumire: denumire.trim(),
      descriere: descriere?.trim() || "",
      pret: Number(pret),
      durataMinute: Number(durataMinute) || 30,
    });

    await logger.admin(
      `Serviciu medical adăugat: '${nouServiciu.denumire}' (Preț: ${nouServiciu.pret} RON, Durată: ${nouServiciu.durataMinute} min)`,
      "/api/servicii",
      user.email,
      { serviciuId: nouServiciu._id, pret: nouServiciu.pret }
    );

    return NextResponse.json({ success: true, serviciu: nouServiciu });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/servicii", "Eroare la adăugarea serviciului", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la adăugarea serviciului" },
      { status: 500 }
    );
  }
}
