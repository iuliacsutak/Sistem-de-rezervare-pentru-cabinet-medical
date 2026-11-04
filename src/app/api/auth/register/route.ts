import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { JWTPayloadData } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { nume, email, parola, telefon, cnp } = await request.json();

    if (!nume || !email || !parola) {
      await logger.warn("/api/auth/register", "Tentativă înregistrare cu câmpuri lipsă", { email, nume });
      return NextResponse.json(
        { success: false, message: "Numele, emailul și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    if (parola.length < 6) {
      await logger.warn("/api/auth/register", "Parolă prea scurtă la înregistrare", { email });
      return NextResponse.json(
        { success: false, message: "Parola trebuie să aibă minim 6 caractere." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      await logger.auth(
        `Eșec înregistrare: adresa de email '${email}' există deja în baza de date`,
        "/api/auth/register",
        email
      );
      return NextResponse.json(
        { success: false, message: "Un cont cu această adresă de email există deja." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(parola);

    const newUser = await User.create({
      nume: nume.trim(),
      email: email.toLowerCase().trim(),
      parola: hashedPassword,
      telefon: telefon?.trim() || "",
      cnp: cnp?.trim() || "",
      rol: "PATIENT",
    });

    const payload: JWTPayloadData = {
      userId: newUser._id.toString(),
      email: newUser.email,
      nume: newUser.nume,
      rol: newUser.rol,
    };

    const token = await signToken(payload);
    await setAuthCookie(token);

    await logger.auth(
      `Cont pacient nou creat cu succes pentru '${newUser.nume}' (${newUser.email}) - Parolă criptată cu bcrypt`,
      "/api/auth/register",
      newUser.email,
      "PATIENT",
      { id: newUser._id }
    );

    return NextResponse.json({
      success: true,
      message: "Contul a fost creat cu succes!",
      user: {
        id: newUser._id,
        nume: newUser.nume,
        email: newUser.email,
        rol: newUser.rol,
      },
      redirectUrl: "/dashboard/pacient",
    });
  } catch (error: unknown) {
    const err = error as Error;
    await logger.error("/api/auth/register", "Eroare la înregistrarea pacientului", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Eroare la crearea contului." },
      { status: 500 }
    );
  }
}
