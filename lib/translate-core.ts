export type Target = "en" | "es";

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
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${target}`,
  );
  if (!res.ok) return text;
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
  };
  return data.responseData?.translatedText ?? text;
}

export async function translateTextCore(
  text: string,
  target: Target,
): Promise<string> {
  try {
    return await translateWithDeepL(text, target);
  } catch {
    return translateFallback(text, target);
  }
}
