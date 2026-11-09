import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

// Ia ultimele notificări ale utilizatorului logat
export async function GET() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    await connectToDatabase();

    const notificari = await Notification.find({ userId: userSession.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const necitite = await Notification.countDocuments({
      userId: userSession.userId,
      citita: false,
    });

    return NextResponse.json({ success: true, notificari, necitite });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la preluarea notificărilor" },
      { status: 500 }
    );
  }
}

// Marchează toate notificările ca citite
export async function PATCH() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ success: false, message: "Neautentificat" }, { status: 401 });
    }

    await connectToDatabase();

    await Notification.updateMany(
      { userId: userSession.userId, citita: false },
      { citita: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la actualizarea notificărilor" },
      { status: 500 }
    );
  }
}