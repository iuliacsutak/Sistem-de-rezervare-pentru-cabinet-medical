import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SystemLog from "@/models/SystemLog";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (nivel && nivel !== "TOATE") {
      query.nivel = nivel;
    }

    const loguri = await SystemLog.find(query).sort({ dataOra: -1 }).limit(limit);

    return NextResponse.json({ success: true, loguri });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea logurilor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Acces neautorizat" }, { status: 403 });
    }

    await connectToDatabase();
    await SystemLog.deleteMany({});

    return NextResponse.json({ success: true, message: "Jurnalul de loguri a fost curățat." });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la ștergerea logurilor" },
      { status: 500 }
    );
  }
}

