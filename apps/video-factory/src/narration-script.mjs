/**
 * Build a 25-30 second narration script from a Tool record.
 * Aim for ~70 words at conversational pace.
 */

const formatPriceWord = (p) => {
  if (p.priceUsd === "free") return "free";
  if (p.priceUsd === "custom") return "custom pricing";
  return p.perMonth ? `${p.priceUsd} dollars a month` : `${p.priceUsd} dollars`;
};

export function buildNarrationScript({ tool, categoryLabel }) {
  const cleanName = tool.name.replace(/[^a-zA-Z0-9 ]/g, "");
  const startingPaid = tool.pricing.find((p) => typeof p.priceUsd === "number");
  const hasFree = tool.pricing.some((p) => p.priceUsd === "free");

  const features = tool.features.slice(0, 3).join(", ");
  const bestFor = tool.bestFor && tool.bestFor.length
    ? `Best for ${tool.bestFor.slice(0, 2).join(" and ")}.`
    : "";

  let pricingLine = "";
  if (hasFree && startingPaid) {
    pricingLine = `Free tier available, paid plans start at ${formatPriceWord(startingPaid)}.`;
  } else if (hasFree) {
    pricingLine = `Free to use.`;
  } else if (startingPaid) {
    pricingLine = `Paid plans start at ${formatPriceWord(startingPaid)}.`;
  }

  const script = [
    `Today's AI tool of the day, ${cleanName}.`,
    `${tool.tagline}`,
    `Key features include ${features}.`,
    bestFor,
    pricingLine,
    `Compare ${cleanName} and other AI tools at whichaitool dot vercel dot app.`,
  ]
    .filter(Boolean)
    .join(" ");

  return script;
}
