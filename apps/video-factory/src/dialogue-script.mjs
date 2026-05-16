/**
 * Build a 2-person dialogue script comparing two AI tools.
 * Output: array of { speaker, text } lines, ~2-3 minutes total.
 *
 * Roles:
 *   host   = Emma (female, friendly framing, asks questions)
 *   expert = Andrew (male, professional, gives details)
 */

const formatPriceWord = (p) => {
  if (p.priceUsd === "free") return "free";
  if (p.priceUsd === "custom") return "custom pricing";
  return p.perMonth ? `${p.priceUsd} dollars a month` : `${p.priceUsd}`;
};

const startingPrice = (tool) => {
  const paid = tool.pricing.find((p) => typeof p.priceUsd === "number");
  if (paid) return formatPriceWord(paid);
  if (tool.pricing.some((p) => p.priceUsd === "free")) return "free";
  return "custom pricing";
};

export function buildDialogueScript({ toolA, toolB, categoryLabel }) {
  const a = toolA.name.replace(/[^a-zA-Z0-9 ]/g, "");
  const b = toolB.name.replace(/[^a-zA-Z0-9 ]/g, "");

  const aPrice = startingPrice(toolA);
  const bPrice = startingPrice(toolB);

  const aFeatures = toolA.features.slice(0, 3).join(", ");
  const bFeatures = toolB.features.slice(0, 3).join(", ");

  const aPros = toolA.pros && toolA.pros.length ? toolA.pros[0] : null;
  const bPros = toolB.pros && toolB.pros.length ? toolB.pros[0] : null;

  const aBest = toolA.bestFor && toolA.bestFor.length ? toolA.bestFor[0] : null;
  const bBest = toolB.bestFor && toolB.bestFor.length ? toolB.bestFor[0] : null;

  const lines = [
    { speaker: "host", text: `Welcome back to WhichAITool. Today we're comparing ${a} and ${b}, both popular ${categoryLabel} tools.` },
    { speaker: "expert", text: `That's right. Let's break this down so you can pick the right one for your workflow.` },

    { speaker: "host", text: `Let's start with pricing. How does ${a} compare to ${b}?` },
    { speaker: "expert", text: `${a} starts at ${aPrice}, while ${b} starts at ${bPrice}. The pricing strategies are similar, but the value depends on what you actually need.` },

    { speaker: "host", text: `What about features? What does ${a} bring to the table?` },
    { speaker: "expert", text: `${a} stands out with ${aFeatures}.${aPros ? ` Its biggest advantage is ${aPros.toLowerCase()}.` : ""}` },

    { speaker: "host", text: `And ${b}?` },
    { speaker: "expert", text: `${b} focuses on ${bFeatures}.${bPros ? ` What it's known for is ${bPros.toLowerCase()}.` : ""}` },

    { speaker: "host", text: `So who should pick which?` },
    {
      speaker: "expert",
      text: `${aBest ? `If your main use case is ${aBest}, ${a} is the better fit.` : `${a} is great for general use.`} ${bBest ? `If you need ${bBest}, ${b} is stronger there.` : `${b} excels in its specialty.`}`,
    },

    { speaker: "host", text: `Great breakdown. For a full feature-by-feature comparison, head to whichaitool dot vercel dot app slash compare slash ${toolA.slug}-vs-${toolB.slug}.` },
    { speaker: "expert", text: `And subscribe for more AI tool comparisons. See you next time.` },
  ];

  return lines;
}
