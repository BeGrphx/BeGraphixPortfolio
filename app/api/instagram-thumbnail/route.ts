import { fetchInstagramThumbnail, normalizeInstagramUrl } from "@/lib/instagram";

export const revalidate = 86_400;

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url || !normalizeInstagramUrl(url)) {
    return Response.json({ thumbnail: null }, { status: 400 });
  }

  const thumbnail = await fetchInstagramThumbnail(url);
  return Response.json({ thumbnail });
}
