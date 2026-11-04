import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { JWTPayloadData } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { email, parola, expectedRole } = await request.json();

    if (!email || !parola) {
      await logger.auth("Eșec autentificare: lipsesc emailul sau parola", "/api/auth/login", email);
      return NextResponse.json(
        { success: false, message: "Emailul și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.parola) {
      await logger.auth(
        `Eșec autentificare: utilizatorul cu email-ul '${email}' nu există`,
        "/api/auth/login",
        email
      );
      return NextResponse.json(
        { success: false, message: "Date de autentificare incorecte." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(parola, user.parola);
    if (!isMatch) {
      await logger.auth(
        `Eșec autentificare: parolă incorectă pentru utilizatorul '${email}'`,
        "/api/auth/login",
        user.email,
        user.rol
      );
      return NextResponse.json(
        { success: false, message: "Date de autentificare incorecte." },
        { status: 401 }
      );
    }

    // Role check if the login page is role-specific
    if (expectedRole && user.rol !== expectedRole) {
      const roleNames = {
        PATIENT: "Pacient",
        DOCTOR: "Medic",
        ADMIN: "Administrator",
      };
      await logger.auth(
        `Refuz autentificare: rolul '${user.rol}' nu corespunde portalului solicitat '${expectedRole}'`,
        "/api/auth/login",
        user.email,
        user.rol
      );
      return NextResponse.json(
        {
          success: false,
          message: `Acest cont are rolul de ${roleNames[user.rol] || user.rol}. Vă rugăm să folosiți portalul corespunzător.`,
        },
        { status: 403 }
      );
    }

    let doctorProfileId: string | undefined;
    if (user.rol === "DOCTOR") {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        doctorProfileId = doctor._id.toString();
      }
    }

    const payload: JWTPayloadData = {
      userId: user._id.toString(),
      email: user.email,
      nume: user.nume,
      rol: user.rol,
      doctorProfileId,
    };

    const token = await signToken(payload);
    await setAuthCookie(token);

    // Determine redirect url
    let redirectUrl = "/dashboard/pacient";
    if (user.rol === "DOCTOR") redirectUrl = "/dashboard/medic";
    if (user.rol === "ADMIN") redirectUrl = "/dashboard/admin";

    await logger.auth(
      `Autentificare reușită pentru '${user.nume}' (${user.email}) -> Redirecționare către ${redirectUrl}`,
      "/api/auth/login",
      user.email,
      user.rol,
      { redirectUrl }
    );

    return NextResponse.json({
      success: true,
      message: "Autentificare reușită!",
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        rol: user.rol,
      },
      redirectUrl,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/auth/login", "Eroare excepție la autentificare", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare internă de server." },
      { status: 500 }
    );
  }
}
