import { connectToDatabase } from "./mongodb";
import SystemLog from "@/models/SystemLog";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUTH" | "PROGRAMARE" | "ADMIN" | "HTTP";

interface LogParams {
  nivel: LogLevel;
  ruta: string;
  metoda?: string;
  mesaj: string;
  utilizatorEmail?: string;
  utilizatorRol?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalii?: any;
  ip?: string;
}

export function formatTerminalTimestamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  HTTP: "\x1b[36m", // Cyan
  AUTH: "\x1b[33m", // Yellow
  PROGRAMARE: "\x1b[32m", // Green
  ADMIN: "\x1b[35m", // Magenta
  INFO: "\x1b[34m", // Blue
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

export async function logEvent({
  nivel,
  ruta,
  metoda = "GET",
  mesaj,
  utilizatorEmail = "Anonim",
  utilizatorRol = "VIZITATOR",
  detalii,
  ip = "127.0.0.1",
}: LogParams) {
  const timestamp = formatTerminalTimestamp();
  const color = LEVEL_COLORS[nivel] || "";

  // Output to Node.js terminal
  const detailsStr = detalii ? ` | Detalii: ${JSON.stringify(detalii)}` : "";
  console.log(
    `${color}[${timestamp}] [${nivel}]${RESET} ${BOLD}${metoda} ${ruta}${RESET} - ${mesaj} (User: ${utilizatorEmail} [${utilizatorRol}])${detailsStr}`
  );

  // Save to MongoDB asynchronously (non-blocking)
  try {
    await connectToDatabase();
    await SystemLog.create({
      dataOra: new Date(),
      nivel,
      metoda,
      ruta,
      mesaj,
      utilizatorEmail,
      utilizatorRol,
      ip,
      detalii,
    });
  } catch (err) {
    // Fail silently in terminal to not crash application flow
    console.error("Nu s-a putut salva log-ul în MongoDB:", (err as Error).message);
  }
}

// Convenience helpers
export const logger = {
  http: (ruta: string, metoda: string, mesaj: string, user?: { email?: string; rol?: string }, ip?: string) =>
    logEvent({
      nivel: "HTTP",
      ruta,
      metoda,
      mesaj,
      utilizatorEmail: user?.email,
      utilizatorRol: user?.rol,
      ip,
    }),

  auth: (mesaj: string, ruta: string, userEmail?: string, rol?: string, detalii?: unknown) =>
    logEvent({
      nivel: "AUTH",
      ruta,
      metoda: "POST",
      mesaj,
      utilizatorEmail: userEmail || "Anonim",
      utilizatorRol: rol || "VIZITATOR",
      detalii,
    }),

  programare: (mesaj: string, ruta: string, userEmail?: string, rol?: string, detalii?: unknown) =>
    logEvent({
      nivel: "PROGRAMARE",
      ruta,
      metoda: "POST",
      mesaj,
      utilizatorEmail: userEmail,
      utilizatorRol: rol,
      detalii,
    }),

  admin: (mesaj: string, ruta: string, userEmail?: string, detalii?: unknown) =>
    logEvent({
      nivel: "ADMIN",
      ruta,
      metoda: "PUT",
      mesaj,
      utilizatorEmail: userEmail,
      utilizatorRol: "ADMIN",
      detalii,
    }),

  info: (ruta: string, mesaj: string, detalii?: unknown) =>
    logEvent({
      nivel: "INFO",
      ruta,
      mesaj,
      detalii,
    }),

  warn: (ruta: string, mesaj: string, detalii?: unknown) =>
    logEvent({
      nivel: "WARN",
      ruta,
      mesaj,
      detalii,
    }),

  error: (ruta: string, mesaj: string, err?: unknown) =>
    logEvent({
      nivel: "ERROR",
      ruta,
      mesaj,
      detalii: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    }),
};
