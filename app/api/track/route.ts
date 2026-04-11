import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, slug, referrer, utm_source, utm_medium, utm_campaign, lang } = body;

    if (!page) {
      return NextResponse.json({ error: "page required" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const userAgent = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || null;

    await sb.from("page_views").insert({
      page,
      slug: slug || null,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      user_agent: userAgent,
      lang: lang || "en",
      country,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // fail silently
  }
}
