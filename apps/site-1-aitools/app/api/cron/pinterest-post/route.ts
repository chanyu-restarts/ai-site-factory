import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { TOOLS } from "@/lib/data/tools";
import { CATEGORY_LABELS } from "@/lib/types";
import { ensureBoard, createPin } from "@/lib/pinterest/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HISTORY_BLOB_KEY = "pinterest-history.json";
const POST_LIMIT_PER_RUN = 5;
const PINTEREST_RATE_LIMIT_MS = 2000;

type HistoryEntry = { pinId: string; boardId: string; postedAt: string };
type History = Record<string, HistoryEntry>;

async function loadHistory(): Promise<History> {
  try {
    const { blobs } = await list({ prefix: HISTORY_BLOB_KEY, limit: 1 });
    const found = blobs.find((b) => b.pathname === HISTORY_BLOB_KEY);
    if (!found) return {};
    const res = await fetch(found.url, { cache: "no-store" });
    if (!res.ok) return {};
    return (await res.json()) as History;
  } catch {
    return {};
  }
}

async function saveHistory(history: History): Promise<void> {
  await put(HISTORY_BLOB_KEY, JSON.stringify(history, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

function buildPinContent(
  tool: (typeof TOOLS)[number],
  categoryLabel: string,
  siteUrl: string,
) {
  const link = `${siteUrl}/tools/${tool.slug}`;
  const imageUrl = `${siteUrl}/tools/${tool.slug}/opengraph-image`;

  const features = tool.features.slice(0, 3).join(" · ");
  const bestFor = tool.bestFor.slice(0, 2).join(", ");

  const description = [
    tool.tagline,
    "",
    `✦ ${features}`,
    `✦ Best for: ${bestFor}`,
    "",
    `Compare ${tool.name} side by side with alternatives at WhichAITool.`,
    "",
    `#AITools #${tool.category.replace(/-/g, "")} #${tool.name.replace(/[^a-zA-Z0-9]/g, "")}`,
  ].join("\n");

  return {
    title: `${tool.name} — ${categoryLabel}`,
    description,
    altText: `${tool.name}: ${tool.tagline}`,
    link,
    imageUrl,
  };
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "PINTEREST_ACCESS_TOKEN not configured" },
      { status: 503 },
    );
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://whichaitool.vercel.app"
  ).replace(/\/$/, "");

  const history = await loadHistory();
  const toPost = TOOLS.filter((t) => !history[t.slug]).slice(0, POST_LIMIT_PER_RUN);

  if (toPost.length === 0) {
    return NextResponse.json({
      status: "all_posted",
      total: TOOLS.length,
      historySize: Object.keys(history).length,
    });
  }

  const boardCache: Record<string, string> = {};
  const results: Array<{ slug: string; ok: boolean; pinId?: string; error?: string }> = [];

  for (const tool of toPost) {
    const categoryLabel = CATEGORY_LABELS[tool.category];

    try {
      let boardId = boardCache[tool.category];
      if (!boardId) {
        const board = await ensureBoard(
          categoryLabel,
          `Curated ${categoryLabel.toLowerCase()} reviewed at WhichAITool — pricing, features, and head-to-head comparisons.`,
        );
        boardId = board.id;
        boardCache[tool.category] = boardId;
      }

      const content = buildPinContent(tool, categoryLabel, siteUrl);
      const pin = await createPin({
        boardId,
        imageUrl: content.imageUrl,
        link: content.link,
        title: content.title,
        description: content.description,
        altText: content.altText,
      });

      history[tool.slug] = {
        pinId: pin.id,
        boardId,
        postedAt: new Date().toISOString(),
      };
      results.push({ slug: tool.slug, ok: true, pinId: pin.id });

      await new Promise((r) => setTimeout(r, PINTEREST_RATE_LIMIT_MS));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ slug: tool.slug, ok: false, error: message });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  if (succeeded > 0) {
    await saveHistory(history);
  }

  return NextResponse.json({
    posted: succeeded,
    failed: results.length - succeeded,
    total: TOOLS.length,
    remaining: TOOLS.length - Object.keys(history).length,
    results,
  });
}
