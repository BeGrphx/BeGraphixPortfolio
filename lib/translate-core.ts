export type Target = "en" | "es";

const MYMEMORY_MAX = 450;

function chunkText(text: string, maxLen = MYMEMORY_MAX): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let rest = text;

  while (rest.length > 0) {
    if (rest.length <= maxLen) {
      chunks.push(rest);
      break;
    }
    let splitAt = rest.lastIndexOf(" ", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = maxLen;
    chunks.push(rest.slice(0, splitAt).trim());
    rest = rest.slice(splitAt).trim();
  }

  return chunks.filter(Boolean);
}

function isBadTranslation(result: string, original: string): boolean {
  const trimmed = result.trim();
  const upper = trimmed.toUpperCase();
  return (
    !trimmed ||
    /^[.,;:!?…]+$/.test(trimmed) ||
    upper.includes("QUERY LENGTH LIMIT") ||
    upper.includes("MAX ALLOWED QUERY") ||
    result === original
  );
}

async function translateMyMemoryChunk(
  text: string,
  target: Target,
): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${target}`,
  );
  if (!res.ok) return text;
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
  };
  const translated = data.responseData?.translatedText ?? text;
  if (isBadTranslation(translated, text)) return text;
  return translated;
}

export async function translateWithDeepL(
  text: string,
  target: Target,
): Promise<string> {
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

export async function translateFallback(
  text: string,
  target: Target,
): Promise<string> {
  const chunks = chunkText(text);
  const parts = await Promise.all(
    chunks.map((chunk) => translateMyMemoryChunk(chunk, target)),
  );
  return parts.join(chunks.length > 1 ? " " : "");
}

export async function translateTextCore(
  text: string,
  target: Target,
): Promise<string> {
  if (!text.trim()) return text;

  try {
    const deepL = await translateWithDeepL(text, target);
    if (!isBadTranslation(deepL, text)) return deepL;
  } catch {
    // fallback below
  }

  const fallback = await translateFallback(text, target);
  if (isBadTranslation(fallback, text)) return text;
  return fallback;
}
