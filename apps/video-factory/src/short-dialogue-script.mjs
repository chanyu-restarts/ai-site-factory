/**
 * Build a Senpai (A) + Kohai (B) dialogue script for a single AI tool.
 * Target: ~30-35 seconds total at conversational pace, fits in a Short.
 *
 * Output: array of { speaker, text } where speaker ∈ {"A", "B"}.
 *   A = Senpai (calm, analytical, knowledgeable) — Edge TTS Emma voice
 *   B = Kohai (curious, naive, energetic reactions) — Edge TTS Aria voice
 */

const formatPriceWord = (p) => {
  if (p.priceUsd === "free") return "free";
  if (p.priceUsd === "custom") return "custom pricing";
  return p.perMonth ? `${p.priceUsd} dollars a month` : `${p.priceUsd} dollars`;
};

const startingPrice = (tool) => {
  const paid = tool.pricing.find((p) => typeof p.priceUsd === "number");
  if (paid) return formatPriceWord(paid);
  if (tool.pricing.some((p) => p.priceUsd === "free")) return "free";
  return "custom pricing";
};

export function buildShortDialogue({ tool, categoryLabel }) {
  const name = tool.name.replace(/[^a-zA-Z0-9 ]/g, "");
  const tagline = tool.tagline.replace(/\.$/, "");

  // Use cases — what the tool is best for, joined naturally
  const useCases =
    tool.bestFor && tool.bestFor.length >= 2
      ? `${tool.bestFor[0]} and ${tool.bestFor[1]}`
      : tool.bestFor && tool.bestFor[0]
        ? tool.bestFor[0]
        : "general AI tasks";

  // Standout highlight: prefer pros with numbers (most concrete), else first pro
  const numericPro = tool.pros && tool.pros.find((p) => /\d/.test(p));
  const highlight =
    numericPro || (tool.pros && tool.pros[0]) || (tool.features && tool.features[0]) || tagline;
  const highlightLine = highlight.replace(/\.$/, "") + ".";

  // Pricing — clearer phrasing
  const hasFree = tool.pricing.some((p) => p.priceUsd === "free");
  const paid = tool.pricing.find((p) => typeof p.priceUsd === "number");
  let priceLine;
  if (hasFree && paid) {
    priceLine = `Free tier available. Paid plans from ${formatPriceWord(paid)}.`;
  } else if (hasFree) {
    priceLine = `It's completely free.`;
  } else if (paid) {
    priceLine = `Starts at ${formatPriceWord(paid)}.`;
  } else {
    priceLine = `Custom pricing. Check the site for details.`;
  }

  return [
    { speaker: "A", text: `Today's AI tool: ${name}.` },
    { speaker: "B", text: `Ooh, what does it do?` },
    { speaker: "A", text: `${tagline}. Best for ${useCases}.` },
    { speaker: "B", text: `What makes it stand out?` },
    { speaker: "A", text: highlightLine },
    { speaker: "B", text: `Whoa, really?!` },
    { speaker: "A", text: priceLine },
    { speaker: "B", text: `Adding it to my list!` },
    { speaker: "A", text: `Full review at whichaitool dot vercel dot app.` },
  ];
}
