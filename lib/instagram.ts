export function normalizeInstagramUrl(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:[^/?#]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/,
  );
  if (!match) return null;
  return `https://www.instagram.com/${match[1]}/${match[2]}/`;
}

export async function fetchInstagramThumbnail(
  url: string,
): Promise<string | null> {
  const normalized = normalizeInstagramUrl(url);
  if (!normalized) return null;

  try {
    const response = await fetch(normalized, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html",
      },
      next: { revalidate: 86_400 },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (!match?.[1]) return null;

    return match[1].replace(/&amp;/g, "&");
  } catch {
    return null;
  }
}
