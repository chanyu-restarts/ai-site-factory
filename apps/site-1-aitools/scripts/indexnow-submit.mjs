#!/usr/bin/env node
/**
 * IndexNow URL submission script.
 *
 * Pushes the full list of canonical URLs (homepage, tool detail, category,
 * compare, legal pages) to Bing / Yandex / Naver via the IndexNow API.
 * Recommended frequency: once after a content rebuild, or on a weekly cron.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs
 *
 * Env:
 *   NEXT_PUBLIC_SITE_URL  — site origin (defaults to whichaitool.vercel.app)
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const INDEXNOW_KEY = "deb29ea70abc762c1de7170317b24f585798fc233e4d6f54f01f35565b01cdcb";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000;

async function loadToolsAndCategories() {
  const toolsPath = resolve(__dirname, "..", "lib", "data", "tools.ts");
  const typesPath = resolve(__dirname, "..", "lib", "types.ts");
  const toolsUrl = "file:///" + toolsPath.replace(/\\/g, "/");
  const typesUrl = "file:///" + typesPath.replace(/\\/g, "/");
  const { TOOLS } = await import(toolsUrl);
  const { CATEGORY_LABELS } = await import(typesUrl);
  return { TOOLS, CATEGORY_LABELS };
}

function buildUrlList(siteUrl, TOOLS, CATEGORY_LABELS) {
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/about`,
    `${siteUrl}/contact`,
    `${siteUrl}/privacy`,
    `${siteUrl}/affiliate-disclosure`,
    `${siteUrl}/how-we-review`,
  ];

  for (const cat of Object.keys(CATEGORY_LABELS)) {
    urls.push(`${siteUrl}/category/${cat}`);
  }

  for (const tool of TOOLS) {
    urls.push(`${siteUrl}/tools/${tool.slug}`);
  }

  for (const a of TOOLS) {
    for (const b of TOOLS) {
      if (a.slug !== b.slug && a.category === b.category) {
        urls.push(`${siteUrl}/compare/${a.slug}-vs-${b.slug}`);
      }
    }
  }

  return urls;
}

async function submitBatch(host, urlList) {
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IndexNow ${res.status} ${res.statusText}: ${text}`);
  }
  return res.status;
}

async function main() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://whichaitool.vercel.app"
  ).replace(/\/$/, "");
  const host = new URL(siteUrl).hostname;

  console.log(`🔎 IndexNow submission`);
  console.log(`   Host: ${host}`);
  console.log(`   Key location: https://${host}/${INDEXNOW_KEY}.txt`);
  console.log("");

  const { TOOLS, CATEGORY_LABELS } = await loadToolsAndCategories();
  const urls = buildUrlList(siteUrl, TOOLS, CATEGORY_LABELS);

  console.log(`📜 Total URLs: ${urls.length}`);
  console.log("");

  let submitted = 0;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    process.stdout.write(`   ▶ Submitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs) ... `);
    try {
      const status = await submitBatch(host, batch);
      console.log(`OK (${status})`);
      submitted += batch.length;
    } catch (err) {
      console.log(`FAILED`);
      console.error(`     ${err.message}`);
    }
  }

  console.log("");
  console.log(`✨ Done. Submitted: ${submitted} / ${urls.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
