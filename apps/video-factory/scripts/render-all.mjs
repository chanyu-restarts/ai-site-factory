#!/usr/bin/env node
/**
 * Batch-render every tool in TOOLS as a YouTube Short MP4.
 *
 * Idempotent: skips tools whose output/<slug>.mp4 already exists unless
 * --force is passed.
 *
 * Usage:
 *   npm run render:all
 *   npm run render:all -- --max=10                     (render at most 10)
 *   npm run render:all -- --start-from=midjourney      (start at slug)
 *   npm run render:all -- --category=image             (filter by category key)
 *   npm run render:all -- --force                      (re-render everything)
 *   npm run render:all -- --no-audio                   (skip TTS)
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync } from "node:fs";
import { generateNarration } from "./narrate.mjs";

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
  const typesPath = resolve(ROOT, "..", "site-1-aitools", "lib", "types.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  const { CATEGORY_LABELS } = await import(pathToFileURL(typesPath).href);
  return { TOOLS, CATEGORY_LABELS };
}

async function renderOne({ tool, categoryLabel, bundled, audioFile }) {
  const inputProps = {
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    category: categoryLabel,
    features: tool.features,
    pricing: tool.pricing,
    websiteUrl: tool.websiteUrl,
    pricingModel: tool.pricingModel,
    audioFile,
  };

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "ToolShort",
    inputProps,
  });

  const outputLocation = resolve(OUTPUT_DIR, `${tool.slug}.mp4`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation,
    inputProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r  Progress: ${(progress * 100).toFixed(1)}%`);
    },
  });
  process.stdout.write("\n");
  return outputLocation;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  const args = parseArgs();
  const max = args.max ? parseInt(args.max, 10) : Infinity;
  const startFrom = args["start-from"];
  const category = args.category;
  const force = args.force === "true";
  const noAudio = args["no-audio"] === "true";

  const { TOOLS, CATEGORY_LABELS } = await loadTools();

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
  if (!force) {
    queue = queue.filter((t) => !existsSync(resolve(OUTPUT_DIR, `${t.slug}.mp4`)));
  }
  if (queue.length > max) queue = queue.slice(0, max);

  if (queue.length === 0) {
    console.log("Nothing to render. (Use --force to re-render existing.)");
    return;
  }

  console.log(`Queue: ${queue.length} tool(s)\n`);

  // Phase 1: pre-generate all TTS audio so they exist in public/audio/
  // BEFORE the Remotion bundle snapshots that directory.
  const audioReady = new Map();
  if (!noAudio) {
    console.log(`[Phase 1/3] Generating narration audio for ${queue.length} tool(s)...`);
    for (const tool of queue) {
      try {
        const audioFile = await generateNarration(tool.slug);
        audioReady.set(tool.slug, audioFile);
      } catch (err) {
        console.error(`  TTS FAILED for ${tool.slug}: ${err.message ?? err}`);
      }
    }
    console.log(`  Audio ready: ${audioReady.size} / ${queue.length}\n`);
  }

  // Phase 2: bundle once, with all audio files now present in public/audio/
  console.log(`[Phase 2/3] Bundling Remotion project (one-time)...`);
  const bundled = await bundle({
    entryPoint: resolve(ROOT, "src/index.ts"),
    webpackOverride: (cfg) => cfg,
  });

  // Phase 3: render each tool using the bundled output (audio resolved at render time)
  console.log(`\n[Phase 3/3] Rendering ${queue.length} video(s)...`);

  let done = 0;
  let failed = 0;
  const startedAt = Date.now();

  for (const tool of queue) {
    const categoryLabel = CATEGORY_LABELS[tool.category] ?? tool.category;
    const idx = ++done;
    console.log(`\n[${idx}/${queue.length}] ${tool.slug} (${tool.name})`);
    try {
      const audioFile = noAudio ? undefined : audioReady.get(tool.slug);
      const out = await renderOne({ tool, categoryLabel, bundled, audioFile });
      console.log(`  -> ${out}`);
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${err.message ?? err}`);
    }
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n=== DONE ===`);
  console.log(`  Rendered: ${done - failed} / ${queue.length}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Elapsed:  ${elapsedSec}s`);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
