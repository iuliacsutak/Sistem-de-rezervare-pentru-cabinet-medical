import { NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST() {
  const user = await getCurrentUser();
  await clearAuthCookie();

  if (user) {
    await logger.auth(
      `Deconectare utilizator: ${user.nume} (${user.email}) [${user.rol}]`,
      "/api/auth/logout",
      user.email,
      user.rol
    );
  }

  return NextResponse.json({ success: true, message: "Deconectare reușită." });
}
