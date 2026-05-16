#!/usr/bin/env node
/**
 * Upload a generated MP4 to YouTube via the Data API v3.
 *
 * Prereqs in .env.local at repo root:
 *   YOUTUBE_CLIENT_ID
 *   YOUTUBE_CLIENT_SECRET
 *   YOUTUBE_REFRESH_TOKEN  (run get-youtube-refresh-token.mjs once to obtain)
 *
 * Usage:
 *   npm run upload-youtube -- --slug=chatgpt --type=short
 *   npm run upload-youtube -- --slugA=chatgpt --slugB=claude --type=compare
 *   npm run upload-youtube -- ... --privacy=unlisted   (default: public)
 */

import { google } from "googleapis";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, createReadStream, readFileSync, writeFileSync, statSync } from "node:fs";
import { buildShortMetadata, buildCompareMetadata } from "../src/youtube-metadata.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT_DIR = resolve(ROOT, "output");
const TRACKER_PATH = resolve(OUTPUT_DIR, "posted-videos.json");

function parseArgs() {
  return Object.fromEntries(
    process.argv
      .slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v] = a.replace(/^--/, "").split("=");
        return [k, v ?? "true"];
      }),
  );
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

async function loadTool(slug) {
  const toolsPath = resolve(ROOT, "..", "site-1-aitools", "lib", "data", "tools.ts");
  const typesPath = resolve(ROOT, "..", "site-1-aitools", "lib", "types.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  const { CATEGORY_LABELS } = await import(pathToFileURL(typesPath).href);
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) fail(`Tool not found: ${slug}`);
  return { tool: t, categoryLabel: CATEGORY_LABELS[t.category] ?? t.category };
}

function loadTracker() {
  if (!existsSync(TRACKER_PATH)) return [];
  try {
    return JSON.parse(readFileSync(TRACKER_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveTracker(records) {
  writeFileSync(TRACKER_PATH, JSON.stringify(records, null, 2));
}

function getOAuthClient() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    fail(
      "Missing YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN in .env.local. See README.",
    );
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

async function uploadVideo({ filePath, title, description, tags, privacyStatus }) {
  const auth = getOAuthClient();
  const youtube = google.youtube({ version: "v3", auth });
  const fileSize = statSync(filePath).size;

  console.log(`Uploading ${filePath} (${(fileSize / 1024 / 1024).toFixed(1)}MB)...`);

  const res = await youtube.videos.insert(
    {
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title.slice(0, 100),
          description,
          tags: tags.slice(0, 30),
          categoryId: "28",
          defaultLanguage: "en",
          defaultAudioLanguage: "en",
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      media: { body: createReadStream(filePath) },
    },
    {
      onUploadProgress: (evt) => {
        if (evt.bytesRead) {
          process.stdout.write(`\r  ${(evt.bytesRead / 1024 / 1024).toFixed(1)}MB uploaded`);
        }
      },
    },
  );

  process.stdout.write("\n");
  return res.data;
}

async function uploadShort({ slug, privacy }) {
  const filePath = resolve(OUTPUT_DIR, `${slug}.mp4`);
  if (!existsSync(filePath))
    fail(`MP4 not found: ${filePath}. Run 'npm run render -- --slug=${slug}' first.`);

  const { tool, categoryLabel } = await loadTool(slug);
  const meta = buildShortMetadata(tool, categoryLabel);

  console.log(`Title: ${meta.title}`);
  console.log(`Tags (${meta.tags.length}): ${meta.tags.slice(0, 8).join(", ")}...`);
  console.log("");

  const result = await uploadVideo({
    filePath,
    title: meta.title,
    description: meta.description,
    tags: meta.tags,
    privacyStatus: privacy,
  });

  return { key: `short:${slug}`, title: meta.title, video: result };
}

async function uploadCompare({ slugA, slugB, privacy }) {
  const dirName = `${slugA}-vs-${slugB}`;
  const filePath = resolve(OUTPUT_DIR, `${dirName}.mp4`);
  if (!existsSync(filePath)) {
    fail(`MP4 not found: ${filePath}. Run 'npm run render-compare -- --slugA=${slugA} --slugB=${slugB}' first.`);
  }

  const { tool: toolA, categoryLabel } = await loadTool(slugA);
  const { tool: toolB } = await loadTool(slugB);
  const meta = buildCompareMetadata(toolA, toolB, categoryLabel);

  console.log(`Title: ${meta.title}`);
  console.log(`Tags (${meta.tags.length}): ${meta.tags.slice(0, 8).join(", ")}...`);
  console.log("");

  const result = await uploadVideo({
    filePath,
    title: meta.title,
    description: meta.description,
    tags: meta.tags,
    privacyStatus: privacy,
  });

  return { key: `compare:${dirName}`, title: meta.title, video: result };
}

async function main() {
  const args = parseArgs();
  const type = args.type ?? "short";
  const privacy = args.privacy ?? "public";

  let result;
  if (type === "short") {
    const slug = args.slug;
    if (!slug) fail("Missing --slug for short upload");
    result = await uploadShort({ slug, privacy });
  } else if (type === "compare") {
    const slugA = args.slugA;
    const slugB = args.slugB;
    if (!slugA || !slugB) fail("Missing --slugA / --slugB for compare upload");
    result = await uploadCompare({ slugA, slugB, privacy });
  } else {
    fail(`Unknown --type: ${type}. Use 'short' or 'compare'.`);
  }

  const videoId = result.video.id;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log("\n=== UPLOAD SUCCESS ===");
  console.log(`  Video ID: ${videoId}`);
  console.log(`  URL: ${url}`);
  console.log(`  Privacy: ${privacy}`);

  const tracker = loadTracker();
  tracker.push({
    key: result.key,
    title: result.title,
    videoId,
    url,
    privacy,
    uploadedAt: new Date().toISOString(),
  });
  saveTracker(tracker);
  console.log(`  Tracker updated: ${TRACKER_PATH}`);
}

main().catch((err) => {
  console.error("\nFatal:", err.errors ?? err.message ?? err);
  process.exit(1);
});
