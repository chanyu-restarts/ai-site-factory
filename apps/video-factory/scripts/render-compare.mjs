#!/usr/bin/env node
/**
 * Render a compare-style dialogue video (1920x1080 landscape, 2-person dialogue).
 *
 * Usage:
 *   npm run render-compare -- --slugA=chatgpt --slugB=claude
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync } from "node:fs";
import { generateDialogueAudio } from "./narrate-compare.mjs";

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

function pickToolFields(t) {
  return {
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    category: t.category,
    features: t.features,
    pricing: t.pricing,
    websiteUrl: t.websiteUrl,
    pricingModel: t.pricingModel,
  };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const args = parseArgs();
  const slugA = args.slugA ?? "chatgpt";
  const slugB = args.slugB ?? "claude";

  console.log(`[1/2] Generating dialogue audio (${slugA} vs ${slugB})...`);
  const { toolA, toolB, categoryLabel, lines, dirName } = await generateDialogueAudio(slugA, slugB);
  console.log("");

  console.log(`[2/2] Rendering compare video...`);
  const fps = 30;
  const inputProps = {
    toolA: pickToolFields(toolA),
    toolB: pickToolFields(toolB),
    categoryLabel,
    lines,
    fps,
  };

  console.log(`Bundling Remotion project...`);
  const bundled = await bundle({
    entryPoint: resolve(ROOT, "src/index.ts"),
    webpackOverride: (cfg) => cfg,
  });

  console.log(`Selecting composition: CompareDuo`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "CompareDuo",
    inputProps,
  });

  const outputLocation = resolve(OUTPUT_DIR, `${dirName}.mp4`);
  console.log(`Rendering -> ${outputLocation}`);
  console.log(
    `  ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames (~${(composition.durationInFrames / fps).toFixed(1)}s)`,
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
