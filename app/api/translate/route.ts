import { NextRequest, NextResponse } from "next/server";
import type { Target } from "@/lib/translate-core";
import { translateTextCore } from "@/lib/translate-core";

export async function POST(request: NextRequest) {
  try {
    const { text, target } = (await request.json()) as {
      text: string;
      target: Target;
    };

    if (!text || !target) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const translated = await translateTextCore(text, target);
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
