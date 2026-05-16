/**
 * Build YouTube video metadata (title, description, tags) for both
 * Shorts (single-tool intro) and Compare (two-tool dialogue) videos.
 */

const SITE_URL = "https://whichaitool.vercel.app";

const baseHashtags = [
  "#AI",
  "#AITools",
  "#AIcomparison",
  "#WhichAITool",
];

function clipDescription(s, maxLen = 4900) {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}

function uniqueTags(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const t of list) {
      const k = t.toLowerCase().trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(t);
      if (out.length >= 30) return out;
    }
  }
  return out;
}

export function buildShortMetadata(tool, categoryLabel) {
  const title = `${tool.name} in 30 seconds — AI tool review #shorts`;
  const url = `${SITE_URL}/tools/${tool.slug}`;

  const lines = [
    `${tool.name}: ${tool.tagline}`,
    "",
    `Top features: ${tool.features.slice(0, 5).join(", ")}.`,
    tool.bestFor && tool.bestFor.length ? `Best for: ${tool.bestFor.slice(0, 3).join(", ")}.` : "",
    "",
    `Full review and comparisons: ${url}`,
    `Browse all AI tools: ${SITE_URL}`,
    "",
    `${baseHashtags.join(" ")} #${tool.name.replace(/[^A-Za-z0-9]/g, "")} #${categoryLabel.replace(/[^A-Za-z0-9]/g, "")}`,
  ].filter((l) => l !== undefined);

  return {
    title,
    description: clipDescription(lines.join("\n")),
    tags: uniqueTags(
      [tool.name, categoryLabel, "AI tools", "AI review", "AI comparison", "WhichAITool"],
      tool.features.slice(0, 5),
      tool.bestFor || [],
    ),
  };
}

export function buildCompareMetadata(toolA, toolB, categoryLabel) {
  const title = `${toolA.name} vs ${toolB.name} — Which AI Tool Wins?`;
  const url = `${SITE_URL}/compare/${toolA.slug}-vs-${toolB.slug}`;

  const lines = [
    `${toolA.name} or ${toolB.name}? In this side-by-side breakdown we cover pricing, features, and who each tool is best for.`,
    "",
    `## ${toolA.name}`,
    `${toolA.tagline}`,
    `Top features: ${toolA.features.slice(0, 4).join(", ")}.`,
    "",
    `## ${toolB.name}`,
    `${toolB.tagline}`,
    `Top features: ${toolB.features.slice(0, 4).join(", ")}.`,
    "",
    `Full feature-by-feature comparison: ${url}`,
    `Browse all AI tools: ${SITE_URL}`,
    "",
    `${baseHashtags.join(" ")} #${toolA.name.replace(/[^A-Za-z0-9]/g, "")} #${toolB.name.replace(/[^A-Za-z0-9]/g, "")} #AIcompare`,
  ];

  return {
    title,
    description: clipDescription(lines.join("\n")),
    tags: uniqueTags(
      [
        `${toolA.name} vs ${toolB.name}`,
        toolA.name,
        toolB.name,
        categoryLabel,
        "AI comparison",
        "AI tools",
        "WhichAITool",
        `${toolA.name} review`,
        `${toolB.name} review`,
      ],
      toolA.features.slice(0, 3),
      toolB.features.slice(0, 3),
    ),
  };
}
