#!/usr/bin/env node
/**
 * Render a single Tool intro short to MP4 (with TTS narration).
 *
 * Usage:
 *   npm run render -- --slug=chatgpt
 *   npm run render -- --slug=chatgpt --no-audio   (skip narration)
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

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    }),
);

const slug = args.slug ?? "chatgpt";

async function loadTool(slug) {
  const toolsPath = resolve(ROOT, "..", "site-1-aitools", "lib", "data", "tools.ts");
  const typesPath = resolve(ROOT, "..", "site-1-aitools", "lib", "types.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  const { CATEGORY_LABELS } = await import(pathToFileURL(typesPath).href);
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) {
    throw new Error(
      `Tool '${slug}' not found. Available (first 10): ${TOOLS.slice(0, 10).map((x) => x.slug).join(", ")}...`,
    );
  }
  return { tool: t, categoryLabel: CATEGORY_LABELS[t.category] ?? t.category };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  let audioFile;
  if (args["no-audio"] !== "true") {
    console.log(`[1/2] Generating narration audio...`);
    audioFile = await generateNarration(slug);
    console.log("");
  }

  console.log(`[2/2] Loading tool: ${slug}`);
  const { tool, categoryLabel } = await loadTool(slug);

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

  console.log(`Bundling Remotion project...`);
  const bundled = await bundle({
    entryPoint: resolve(ROOT, "src/index.ts"),
    webpackOverride: (cfg) => cfg,
  });

  console.log(`Selecting composition: ToolShort`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "ToolShort",
    inputProps,
  });

  const outputLocation = resolve(OUTPUT_DIR, `${slug}.mp4`);
  console.log(`Rendering -> ${outputLocation}`);
  console.log(
    `  ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`,
  );

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
