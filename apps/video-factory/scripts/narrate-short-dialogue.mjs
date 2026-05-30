#!/usr/bin/env node
/**
 * Generate Senpai-Kohai dialogue audio for a single-tool Short.
 *
 * Voices (Edge TTS, free, no API key):
 *   A = Senpai = en-US-EmmaMultilingualNeural
 *   B = Kohai  = en-US-AriaNeural
 *
 * Usage:
 *   npm run narrate:short -- --slug=claude
 *
 * Output:
 *   apps/video-factory/public/audio/<slug>/line-NN.mp3   (one per dialogue line)
 *   apps/video-factory/public/audio/<slug>/metadata.json (speaker, text, file, duration)
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, createWriteStream, statSync, writeFileSync } from "node:fs";
import { buildShortDialogue } from "../src/short-dialogue-script.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const VOICES = {
  A: "en-US-EmmaMultilingualNeural", // Senpai
  B: "en-US-AriaNeural",             // Kohai
};

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

async function generateLine(voice, text, outputPath) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const stream = tts.toStream(text);
  const file = createWriteStream(outputPath);
  await new Promise((resolveP, rejectP) => {
    stream.audioStream.on("data", (chunk) => file.write(chunk));
    stream.audioStream.on("end", () => {
      file.end();
      resolveP();
    });
    stream.audioStream.on("error", rejectP);
  });
}

function estimateDuration(text) {
  // Conversational pace ≈ 2.58 words/sec + 0.6s tail padding for visual breathing room.
  // Minimum 1.8s per line so short reactions don't feel rushed when on-screen.
  const words = text.split(/\s+/).filter(Boolean).length;
  const seconds = words / 2.58 + 0.6;
  return Math.max(seconds, 1.8);
}

export async function generateShortDialogueAudio(slug) {
  const { tool, categoryLabel } = await loadTool(slug);
  const lines = buildShortDialogue({ tool, categoryLabel });

  const audioDir = resolve(ROOT, "public", "audio", slug);
  if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true });

  console.log(`Dialogue: ${lines.length} lines for "${slug}" (${tool.name})`);

  const metadata = [];

  for (let i = 0; i < lines.length; i++) {
    const { speaker, text } = lines[i];
    const fileName = `line-${String(i).padStart(2, "0")}.mp3`;
    const outputPath = resolve(audioDir, fileName);

    process.stdout.write(
      `  [${i + 1}/${lines.length}] ${speaker}: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}" `,
    );
    await generateLine(VOICES[speaker], text, outputPath);

    const sizeBytes = statSync(outputPath).size;
    const durationSec = estimateDuration(text);
    metadata.push({
      index: i,
      speaker,
      text,
      file: `audio/${slug}/${fileName}`,
      durationSec,
      sizeBytes,
    });
    process.stdout.write(`OK (${(sizeBytes / 1024).toFixed(0)}KB, ~${durationSec.toFixed(1)}s)\n`);
  }

  const metadataPath = resolve(audioDir, "metadata.json");
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\nSaved metadata: ${metadataPath}`);

  const totalDuration = metadata.reduce((s, m) => s + m.durationSec, 0);
  console.log(`Total estimated duration: ${totalDuration.toFixed(1)}s`);

  if (totalDuration > 35) {
    console.warn(`Warning: total duration ${totalDuration.toFixed(1)}s exceeds 35s Short target.`);
  }

  return {
    tool,
    categoryLabel,
    lines: metadata,
    audioDir,
    totalDuration,
    slug,
  };
}

async function main() {
  const args = parseArgs();
  const slug = args.slug ?? "claude";
  await generateShortDialogueAudio(slug);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
