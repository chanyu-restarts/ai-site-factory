#!/usr/bin/env node
/**
 * Generate multi-voice dialogue audio for compare videos.
 *
 * Usage:
 *   npx tsx scripts/narrate-compare.mjs --slugA=chatgpt --slugB=claude
 *
 * Output:
 *   public/audio/<slugA>-vs-<slugB>/line-NN.mp3 (one per dialogue line)
 *   public/audio/<slugA>-vs-<slugB>/metadata.json (durations + speaker info)
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, createWriteStream, statSync, writeFileSync } from "node:fs";
import { buildDialogueScript } from "../src/dialogue-script.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const VOICES = {
  host: "en-US-EmmaMultilingualNeural",
  expert: "en-US-AvaMultilingualNeural",
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

async function loadTools(slugA, slugB) {
  const toolsPath = resolve(ROOT, "..", "site-1-aitools", "lib", "data", "tools.ts");
  const typesPath = resolve(ROOT, "..", "site-1-aitools", "lib", "types.ts");
  const { TOOLS } = await import(pathToFileURL(toolsPath).href);
  const { CATEGORY_LABELS } = await import(pathToFileURL(typesPath).href);
  const toolA = TOOLS.find((x) => x.slug === slugA);
  const toolB = TOOLS.find((x) => x.slug === slugB);
  if (!toolA) throw new Error(`Tool not found: ${slugA}`);
  if (!toolB) throw new Error(`Tool not found: ${slugB}`);
  return { toolA, toolB, categoryLabel: CATEGORY_LABELS[toolA.category] ?? toolA.category };
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
  const words = text.split(/\s+/).filter(Boolean).length;
  const seconds = words / 2.58 + 0.3;
  return Math.max(seconds, 1.0);
}

export async function generateDialogueAudio(slugA, slugB) {
  const { toolA, toolB, categoryLabel } = await loadTools(slugA, slugB);
  const lines = buildDialogueScript({ toolA, toolB, categoryLabel });

  const dirName = `${slugA}-vs-${slugB}`;
  const audioDir = resolve(ROOT, "public", "audio", dirName);
  if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true });

  console.log(`Dialogue: ${lines.length} lines (${slugA} vs ${slugB})`);

  const metadata = [];

  for (let i = 0; i < lines.length; i++) {
    const { speaker, text } = lines[i];
    const fileName = `line-${String(i).padStart(2, "0")}.mp3`;
    const outputPath = resolve(audioDir, fileName);

    process.stdout.write(`  [${i + 1}/${lines.length}] ${speaker}: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}" `);
    await generateLine(VOICES[speaker], text, outputPath);

    const sizeBytes = statSync(outputPath).size;
    const durationSec = estimateDuration(text);
    metadata.push({
      index: i,
      speaker,
      text,
      file: `audio/${dirName}/${fileName}`,
      durationSec,
      sizeBytes,
    });
    process.stdout.write(`OK (${(sizeBytes / 1024).toFixed(0)}KB, ~${durationSec.toFixed(1)}s)\n`);
  }

  const metadataPath = resolve(audioDir, "metadata.json");
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\nSaved metadata: ${metadataPath}`);

  const totalDuration = metadata.reduce((s, m) => s + m.durationSec, 0);
  console.log(`Total estimated duration: ${totalDuration.toFixed(1)}s (~${(totalDuration / 60).toFixed(1)} min)`);

  return {
    toolA,
    toolB,
    categoryLabel,
    lines: metadata,
    audioDir,
    totalDuration,
    dirName,
  };
}

async function main() {
  const args = parseArgs();
  const slugA = args.slugA ?? "chatgpt";
  const slugB = args.slugB ?? "claude";
  await generateDialogueAudio(slugA, slugB);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
