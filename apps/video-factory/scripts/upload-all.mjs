#!/usr/bin/env node
/**
 * Batch upload rendered Shorts to YouTube.
 *
 * Quota note: YouTube Data API v3 default = 10,000 units/day, video.insert
 * = 1600 units → ~6 uploads/day. Default --max=5 stays safely under quota.
 *
 * Idempotent: skips tools whose `short:<slug>` key already exists in
 * output/posted-videos.json.
 *
 * Usage:
 *   npm run upload:all                              (5 uploads, public)
 *   npm run upload:all -- --max=3 --privacy=unlisted
 *   npm run upload:all -- --start-from=midjourney
 *   npm run upload:all -- --category=image
 *   npm run upload:all -- --dry-run                 (list what would upload)
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { uploadShort, loadTracker, saveTracker } from "./upload-youtube.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT_DIR = resolve(ROOT, "output");

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

async function loadTools() {
  const toolsPath = resolve(ROOT, "..", "site-1-aitools", "lib", "data", "tools.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  return TOOLS;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = parseArgs();
  const max = args.max ? parseInt(args.max, 10) : 5;
  const privacy = args.privacy ?? "public";
  const startFrom = args["start-from"];
  const category = args.category;
  const dryRun = args["dry-run"] === "true";
  const delaySec = args.delay ? parseInt(args.delay, 10) : 3;

  const TOOLS = await loadTools();
  const tracker = loadTracker();
  const uploadedKeys = new Set(tracker.map((r) => r.key));

  let queue = TOOLS;
  if (category) queue = queue.filter((t) => t.category === category);
  if (startFrom) {
    const idx = queue.findIndex((t) => t.slug === startFrom);
    if (idx === -1) {
      console.error(`Slug not found for --start-from: ${startFrom}`);
      process.exit(1);
    }
    queue = queue.slice(idx);
  }

  // Filter to tools that have an MP4 ready and aren't already uploaded
  const ready = queue
    .filter((t) => existsSync(resolve(OUTPUT_DIR, `${t.slug}.mp4`)))
    .filter((t) => !uploadedKeys.has(`short:${t.slug}`));

  if (ready.length === 0) {
    console.log("Nothing to upload.");
    console.log(`  Tools in queue: ${queue.length}`);
    console.log(`  With MP4 rendered: ${queue.filter((t) => existsSync(resolve(OUTPUT_DIR, `${t.slug}.mp4`))).length}`);
    console.log(`  Already uploaded: ${queue.filter((t) => uploadedKeys.has(`short:${t.slug}`)).length}`);
    console.log("Hint: 'npm run render:all' first if MP4 count is 0.");
    return;
  }

  const batch = ready.slice(0, max);

  console.log(`=== UPLOAD PLAN ===`);
  console.log(`  Total tools:           ${TOOLS.length}`);
  console.log(`  Already uploaded:      ${uploadedKeys.size}`);
  console.log(`  Eligible to upload:    ${ready.length}`);
  console.log(`  Will upload now:       ${batch.length} (max=${max})`);
  console.log(`  Privacy:               ${privacy}`);
  console.log(`  Delay between uploads: ${delaySec}s`);
  console.log(`  Quota cost (est):      ${batch.length * 1600} / 10000 daily units`);
  console.log("");
  console.log("Queue:");
  for (const t of batch) console.log(`  - ${t.slug} (${t.name})`);
  console.log("");

  if (dryRun) {
    console.log("Dry run — exiting without uploading.");
    return;
  }

  let success = 0;
  let failed = 0;
  for (let i = 0; i < batch.length; i++) {
    const tool = batch[i];
    console.log(`\n[${i + 1}/${batch.length}] Uploading short: ${tool.slug}`);
    try {
      const result = await uploadShort({ slug: tool.slug, privacy });
      const videoId = result.video.id;
      const url = `https://www.youtube.com/watch?v=${videoId}`;

      const records = loadTracker();
      records.push({
        key: result.key,
        title: result.title,
        videoId,
        url,
        privacy,
        uploadedAt: new Date().toISOString(),
      });
      saveTracker(records);

      console.log(`  -> ${url}`);
      success++;

      if (i < batch.length - 1) {
        console.log(`  Sleeping ${delaySec}s before next upload...`);
        await sleep(delaySec * 1000);
      }
    } catch (err) {
      failed++;
      const msg = err.errors ?? err.message ?? err;
      console.error(`  FAILED: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
      const errStr = String(msg);
      if (errStr.includes("quotaExceeded") || errStr.includes("dailyLimit")) {
        console.error("\nQuota exceeded — stopping batch.");
        break;
      }
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`  Uploaded: ${success} / ${batch.length}`);
  console.log(`  Failed:   ${failed}`);
}

main().catch((err) => {
  console.error("\nFatal:", err.errors ?? err.message ?? err);
  process.exit(1);
});
