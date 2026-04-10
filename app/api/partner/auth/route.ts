import { NextResponse } from "next/server";
import { PARTNER_COOKIE_NAME } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PARTNER_COOKIE_NAME);
  return response;
}
