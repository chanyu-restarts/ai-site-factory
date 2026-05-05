#!/usr/bin/env node
/**
 * One-time Pinterest seeding script.
 *
 * Posts every tool in lib/data/tools.ts to Pinterest as a pin,
 * grouped into boards by category. Tracks posted slugs in
 * scripts/posted-pins.json to enable safe re-runs (idempotent).
 *
 * Setup:
 *   1. Create a Pinterest Business account
 *      https://business.pinterest.com/
 *   2. Create a Developer App at https://developers.pinterest.com/
 *      Required scopes: boards:read, boards:write, pins:read, pins:write
 *   3. Generate an access token (long-lived recommended)
 *   4. Add to .env.local: PINTEREST_ACCESS_TOKEN=...
 *   5. Run: npm run pin
 *
 * Re-running is safe: tools already in posted-pins.json are skipped.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = resolve(__dirname, "posted-pins.json");

const PINTEREST_API_BASE = "https://api.pinterest.com/v5";

// ─────────────────────────────────────────────────────────────
// Pinterest API helpers
// ─────────────────────────────────────────────────────────────

function getToken() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    console.error(
      "❌ PINTEREST_ACCESS_TOKEN is not set.\n" +
        "   Get one at https://developers.pinterest.com/ and add to .env.local",
    );
    process.exit(1);
  }
  return token;
}

async function pinterestFetch(path, init = {}) {
  const res = await fetch(`${PINTEREST_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinterest API ${res.status}: ${body}`);
  }
  return res.json();
}

async function listBoards() {
  const data = await pinterestFetch("/boards?page_size=100");
  return data.items ?? [];
}

async function createBoard(name, description) {
  return pinterestFetch("/boards", {
    method: "POST",
    body: JSON.stringify({
      name,
      description: description ?? "",
      privacy: "PUBLIC",
    }),
  });
}

async function ensureBoard(name, description) {
  const boards = await listBoards();
  const found = boards.find((b) => b.name.toLowerCase() === name.toLowerCase());
  return found ?? (await createBoard(name, description));
}

async function createPin({ boardId, imageUrl, link, title, description, altText }) {
  return pinterestFetch("/pins", {
    method: "POST",
    body: JSON.stringify({
      board_id: boardId,
      link,
      title: title.slice(0, 100),
      description: description.slice(0, 800),
      alt_text: (altText ?? title).slice(0, 500),
      media_source: { source_type: "image_url", url: imageUrl },
    }),
  });
}

// ─────────────────────────────────────────────────────────────
// History (idempotent re-runs)
// ─────────────────────────────────────────────────────────────

async function loadHistory() {
  if (!existsSync(HISTORY_FILE)) return {};
  try {
    return JSON.parse(await readFile(HISTORY_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function saveHistory(history) {
  await mkdir(dirname(HISTORY_FILE), { recursive: true });
  await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

// ─────────────────────────────────────────────────────────────
// Tool data loader (uses tsx loader for .ts files)
// ─────────────────────────────────────────────────────────────

async function loadToolsAndCategories() {
  const toolsPath = resolve(__dirname, "..", "lib", "data", "tools.ts");
  const typesPath = resolve(__dirname, "..", "lib", "types.ts");
  const toolsUrl = "file:///" + toolsPath.replace(/\\/g, "/");
  const typesUrl = "file:///" + typesPath.replace(/\\/g, "/");
  const { TOOLS } = await import(toolsUrl);
  const { CATEGORY_LABELS } = await import(typesUrl);
  return { TOOLS, CATEGORY_LABELS };
}

// ─────────────────────────────────────────────────────────────
// Pin content templates
// ─────────────────────────────────────────────────────────────

function buildPinContent(tool, categoryLabel, siteUrl) {
  const link = `${siteUrl}/tools/${tool.slug}`;
  const imageUrl = `${siteUrl}/tools/${tool.slug}/opengraph-image`;

  const title = `${tool.name} — ${categoryLabel}`;

  const features = tool.features.slice(0, 3).join(" · ");
  const bestFor = tool.bestFor.slice(0, 2).join(", ");

  const description = [
    `${tool.tagline}`,
    "",
    `✦ ${features}`,
    `✦ Best for: ${bestFor}`,
    "",
    `Compare ${tool.name} side by side with alternatives at WhichAITool.`,
    "",
    `#AITools #${tool.category.replace(/-/g, "")} #${tool.name.replace(/[^a-zA-Z0-9]/g, "")}`,
  ].join("\n");

  const altText = `${tool.name}: ${tool.tagline}`;

  return { title, description, altText, link, imageUrl };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://whichaitool.vercel.app").replace(/\/$/, "");

  console.log(`🚀 Pinterest seeding script`);
  console.log(`   Target site: ${siteUrl}`);
  console.log("");

  const { TOOLS, CATEGORY_LABELS } = await loadToolsAndCategories();
  const history = await loadHistory();

  const toPost = TOOLS.filter((t) => !history[t.slug]);
  if (toPost.length === 0) {
    console.log("✅ All tools already posted. Nothing to do.");
    return;
  }

  console.log(`📌 ${toPost.length} tools to post (${TOOLS.length - toPost.length} already posted)`);
  console.log("");

  // Pre-resolve boards (one per category)
  const boardCache = {};
  const usedCategories = [...new Set(toPost.map((t) => t.category))];
  for (const cat of usedCategories) {
    const label = CATEGORY_LABELS[cat];
    process.stdout.write(`   ▶ Ensuring board "${label}" ... `);
    try {
      const board = await ensureBoard(
        label,
        `Curated ${label.toLowerCase()} reviewed at WhichAITool — pricing, features, and head-to-head comparisons.`,
      );
      boardCache[cat] = board.id;
      console.log(`OK (id=${board.id})`);
    } catch (err) {
      console.log(`FAILED`);
      console.error(`     ${err.message}`);
      process.exit(1);
    }
  }
  console.log("");

  // Post each tool
  let posted = 0;
  let failed = 0;
  for (const tool of toPost) {
    const categoryLabel = CATEGORY_LABELS[tool.category];
    const boardId = boardCache[tool.category];
    const content = buildPinContent(tool, categoryLabel, siteUrl);

    process.stdout.write(`   📌 ${tool.name.padEnd(20)} → ${categoryLabel.padEnd(22)} ... `);
    try {
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
      await saveHistory(history);
      console.log(`OK (pin=${pin.id})`);
      posted++;
      // Pinterest rate limit: be gentle, 2 sec between posts
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.log(`FAILED`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  console.log("");
  console.log(`✨ Done. Posted: ${posted}, Failed: ${failed}, Skipped: ${TOOLS.length - toPost.length}`);
  if (failed > 0) {
    console.log(`   Re-run npm run pin to retry failed posts.`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
