import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cabinet_medical_secret_key_super_secure_2026_dev"
);

function formatTerminalTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const token = request.cookies.get("auth_token")?.value;

  let userPayload: { rol?: string; email?: string; userId?: string; nume?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userPayload = payload as { rol?: string; email?: string; userId?: string; nume?: string };
    } catch {
      userPayload = null;
    }
  }

  const userDescription = userPayload
    ? `${userPayload.nume || userPayload.email} (${userPayload.rol})`
    : "Vizitator Necunoscut";

  // CONCRETE LOGGING: Log every incoming route request in the terminal
  const timestamp = formatTerminalTimestamp();
  console.log(
    `\x1b[36m[${timestamp}] [HTTP RUTA]\x1b[0m \x1b[1m${method} ${pathname}\x1b[0m | Utilizator: ${userDescription} | IP: ${ip}`
  );

  // 1. Protected Patient routes
  if (pathname.startsWith("/dashboard/pacient")) {
    if (!userPayload) {
      console.log(
        `\x1b[33m[${timestamp}] [SECURITATE]\x1b[0m Acces neautorizat la ${pathname} (Utilizator neautentificat). Redirecționare -> /auth/pacient/login`
      );
      const url = new URL("/auth/pacient/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (userPayload.rol !== "PATIENT" && userPayload.rol !== "ADMIN") {
      console.log(
        `\x1b[31m[${timestamp}] [SECURITATE]\x1b[0m Rol insuficient pentru ${pathname} (${userPayload.rol}). Redirecționare -> /`
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Protected Doctor routes
  if (pathname.startsWith("/dashboard/medic")) {
    if (!userPayload) {
      console.log(
        `\x1b[33m[${timestamp}] [SECURITATE]\x1b[0m Acces neautorizat la ${pathname} (Utilizator neautentificat). Redirecționare -> /auth/medic/login`
      );
      const url = new URL("/auth/medic/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (userPayload.rol !== "DOCTOR" && userPayload.rol !== "ADMIN") {
      console.log(
        `\x1b[31m[${timestamp}] [SECURITATE]\x1b[0m Rol necorespunzător pentru ${pathname} (${userPayload.rol}). Redirecționare -> /`
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Protected Admin routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (!userPayload) {
      console.log(
        `\x1b[33m[${timestamp}] [SECURITATE]\x1b[0m Acces neautorizat la ${pathname} (Utilizator neautentificat). Redirecționare -> /auth/admin/login`
      );
      const url = new URL("/auth/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (userPayload.rol !== "ADMIN") {
      console.log(
        `\x1b[31m[${timestamp}] [SECURITATE]\x1b[0m Refuz acces panou administrator pentru rolul ${userPayload.rol}. Redirecționare -> /`
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 4. Redirect logged-in users away from auth pages
  if (
    userPayload &&
    (pathname.startsWith("/auth/pacient") || pathname.startsWith("/auth/medic") || pathname.startsWith("/auth/admin"))
  ) {
    if (userPayload.rol === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (userPayload.rol === "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard/medic", request.url));
    }
    if (userPayload.rol === "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard/pacient", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static images (.svg, .png, .jpg, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
