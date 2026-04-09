import { NextResponse } from "next/server";
import { getPromptsPage } from "@/features/prompts/services/prompts.server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "latest";
  const query = searchParams.get("q") ?? undefined;
  const model = searchParams.get("model") ?? undefined;
  const page = Number(searchParams.get("page") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "20");

  try {
    const data = await getPromptsPage({
      sort: sort === "popular" ? "popular" : sort === "oldest" ? "oldest" : "latest",
      query,
      model,
      page: Number.isFinite(page) ? page : 0,
      limit: Number.isFinite(limit) ? limit : 20,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/prompts] failed", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
