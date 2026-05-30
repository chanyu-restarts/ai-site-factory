#!/usr/bin/env node
/**
 * Render a Senpai-Kohai dialogue Short to MP4.
 *
 * Prereq: run `npm run narrate:short -- --slug=X` first so audio files +
 * metadata.json exist in public/audio/<slug>/.
 *
 * Usage:
 *   npm run render:short -- --slug=claude
 *
 * Output:
 *   apps/video-factory/output/<slug>-dialogue.mp4
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

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

async function loadTool(slug) {
  const toolsPath = resolve(ROOT, "..", "site-1-aitools", "lib", "data", "tools.ts");
  const typesPath = resolve(ROOT, "..", "site-1-aitools", "lib", "types.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  const { CATEGORY_LABELS } = await import(pathToFileURL(typesPath).href);
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Tool not found: ${slug}`);
  return { tool: t, categoryLabel: CATEGORY_LABELS[t.category] ?? t.category };
}

function loadDialogueMetadata(slug) {
  const path = resolve(ROOT, "public", "audio", slug, "metadata.json");
  if (!existsSync(path)) {
    throw new Error(
      `Dialogue metadata not found: ${path}\nRun 'npm run narrate:short -- --slug=${slug}' first.`,
    );
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

async function main() {
  const args = parseArgs();
  const slug = args.slug ?? "claude";

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`[1/3] Loading tool: ${slug}`);
  const { tool, categoryLabel } = await loadTool(slug);

  console.log(`[2/3] Loading dialogue metadata`);
  const lines = loadDialogueMetadata(slug);
  console.log(`  ${lines.length} lines, total ${lines.reduce((s, l) => s + l.durationSec, 0).toFixed(1)}s`);

  const inputProps = {
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    categoryLabel,
    lines,
    fps: 30,
  };

  console.log(`[3/3] Bundling + rendering`);
  const bundled = await bundle({
    entryPoint: resolve(ROOT, "src/index.ts"),
    webpackOverride: (cfg) => cfg,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "DialogueShort",
    inputProps,
  });

  const outputLocation = resolve(OUTPUT_DIR, `${slug}-dialogue.mp4`);
  console.log(`  ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`);
  console.log(`  -> ${outputLocation}`);

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

  console.log(`\nDone: ${outputLocation}`);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
