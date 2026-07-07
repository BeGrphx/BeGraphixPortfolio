import { NextRequest, NextResponse } from "next/server";

type Target = "en" | "es";

async function translateWithDeepL(text: string, target: Target): Promise<string> {
  const key = process.env.DEEPL_AUTH_KEY;
  if (!key) throw new Error("No DeepL key");

  const targetLang = target === "en" ? "EN" : "ES";
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: "FR",
      target_lang: targetLang,
    }),
  });

  if (!res.ok) throw new Error("DeepL error");
  const data = (await res.json()) as {
    translations: { text: string }[];
  };
  return data.translations[0]?.text ?? text;
}

async function translateFallback(text: string, target: Target): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${target}`,
  );
  if (!res.ok) return text;
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
  };
  return data.responseData?.translatedText ?? text;
}

export async function POST(request: NextRequest) {
  try {
    const { text, target } = (await request.json()) as {
      text: string;
      target: Target;
    };

    if (!text || !target) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let translated = text;
    try {
      translated = await translateWithDeepL(text, target);
    } catch {
      translated = await translateFallback(text, target);
    }

    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
