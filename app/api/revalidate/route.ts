import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    paths?: string[];
  };
  const paths = Array.from(
    new Set(
      (body.paths?.length ? body.paths : ["/fr", "/en", "/es"]).map((path) =>
        path.startsWith("/") ? path : `/${path}`,
      ),
    ),
  );

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    timestamp: new Date().toISOString(),
  });
}
