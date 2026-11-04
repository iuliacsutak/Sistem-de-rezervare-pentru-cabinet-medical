import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-parola");
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        telefon: user.telefon,
        cnp: user.cnp,
        rol: user.rol,
        doctorProfileId: session.doctorProfileId,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la obținerea profilului" },
      { status: 500 }
    );
  }
}

