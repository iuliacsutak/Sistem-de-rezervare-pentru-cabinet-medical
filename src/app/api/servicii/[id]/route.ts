import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Service from "@/models/Service";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      await logger.warn("/api/servicii/[id]", "Tentativă neautorizată de ștergere serviciu medical");
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Service.findByIdAndDelete(id);

    await logger.admin(
      `Serviciu medical șters: '${deleted?.denumire || id}' de către ${user.email}`,
      `/api/servicii/${id}`,
      user.email,
      { serviciuId: id }
    );

    return NextResponse.json({ success: true, message: "Serviciul a fost șters" });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error(`/api/servicii/[id]`, "Eroare la ștergerea serviciului", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la ștergerea serviciului" },
      { status: 500 }
    );
  }
}
