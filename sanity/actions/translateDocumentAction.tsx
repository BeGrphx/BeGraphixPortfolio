import { TranslateIcon } from "@sanity/icons";
import { useCallback, useState } from "react";
import { type DocumentActionComponent, useClient } from "sanity";

interface LocalizedField {
  fr?: string;
  en?: string;
  es?: string;
}

async function translateText(
  text: string,
  target: "EN" | "ES",
): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target: target.toLowerCase() }),
  });
  if (!res.ok) throw new Error("Translation failed");
  const data = (await res.json()) as { translated: string };
  return data.translated;
}

async function translateLocalized(
  value: LocalizedField | undefined,
): Promise<LocalizedField | undefined> {
  if (!value?.fr) return value;
  const [en, es] = await Promise.all([
    value.en ? Promise.resolve(value.en) : translateText(value.fr, "EN"),
    value.es ? Promise.resolve(value.es) : translateText(value.fr, "ES"),
  ]);
  return { fr: value.fr, en, es };
}

export const translateDocumentAction: DocumentActionComponent = (props) => {
  const { id, type, draft, published, onComplete } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const [isRunning, setIsRunning] = useState(false);

  const handle = useCallback(async () => {
    if (type !== "project" && type !== "about") return;
    setIsRunning(true);
    try {
      const doc = (draft || published) as Record<string, LocalizedField | undefined>;
      if (!doc) return;

      const patch: Record<string, LocalizedField> = {};

      if (type === "project") {
        for (const field of ["title", "description", "credits"] as const) {
          const translated = await translateLocalized(doc[field]);
          if (translated) patch[field] = translated;
        }
      }

      if (type === "about") {
        if (doc.title) {
          const translated = await translateLocalized(doc.title);
          if (translated) patch.title = translated;
        }
        if (doc.bio) {
          const translated = await translateLocalized(doc.bio);
          if (translated) patch.bio = translated;
        }
      }

      await client.patch(id).set(patch).commit();
      onComplete();
    } finally {
      setIsRunning(false);
    }
  }, [client, draft, id, onComplete, published, type]);

  if (type !== "project" && type !== "about") return null;

  return {
    label: isRunning ? "Traduction…" : "Traduire EN / ES",
    icon: TranslateIcon,
    disabled: isRunning,
    onHandle: handle,
  };
};
