#!/usr/bin/env node
/**
 * Generate MP3 narration via Microsoft Edge Read Aloud (free, no API key).
 *
 * Usage:
 *   npx tsx scripts/narrate.mjs --slug=chatgpt
 *
 * Output:
 *   apps/video-factory/output/<slug>.mp3
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, createWriteStream } from "node:fs";
import { buildNarrationScript } from "../src/narration-script.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const AUDIO_DIR = resolve(ROOT, "public", "audio");

const VOICE = "en-US-EmmaMultilingualNeural";

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

export async function generateNarration(slug) {
  if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });

  const { tool, categoryLabel } = await loadTool(slug);
  const script = buildNarrationScript({ tool, categoryLabel });
  const wordCount = script.split(/\s+/).length;
  console.log(`Script (${wordCount} words):`);
  console.log(`  "${script}"`);

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const outputPath = resolve(AUDIO_DIR, `${slug}.mp3`);
  console.log(`\nGenerating audio -> ${outputPath}`);

  const stream = tts.toStream(script);
  const file = createWriteStream(outputPath);

  await new Promise((resolveP, rejectP) => {
    stream.audioStream.on("data", (chunk) => file.write(chunk));
    stream.audioStream.on("end", () => {
      file.end();
      resolveP();
    });
    stream.audioStream.on("error", rejectP);
  });

  console.log(`Done: ${outputPath}`);
  return `audio/${slug}.mp3`;
}

async function main() {
  const args = parseArgs();
  const slug = args.slug ?? "chatgpt";
  await generateNarration(slug);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
