import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get("reset") === "true";
    const result = await runSeed(reset);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err?.message || "Eroare la rularea seed-ului" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reset = Boolean(body.reset);
    const result = await runSeed(reset);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err?.message || "Eroare la rularea seed-ului" },
      { status: 500 }
    );
  }
}

