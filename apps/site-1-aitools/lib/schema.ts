import type { Tool } from "./types";
import { CATEGORY_LABELS } from "./types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://whichaitool.vercel.app"
).replace(/\/$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "WhichAITool";

export type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    description:
      "Independent AI tool reviews and side-by-side comparisons across LLMs, code, image, video, voice, and automation.",
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function priceFromTool(tool: Tool): {
  price: string;
  priceCurrency: string;
} {
  const lowest = tool.pricing.reduce<number | "free" | null>((acc, t) => {
    if (t.priceUsd === "custom") return acc;
    if (t.priceUsd === "free") return acc === null ? "free" : acc;
    if (typeof t.priceUsd === "number") {
      if (acc === null || acc === "free") return t.priceUsd;
      return Math.min(acc, t.priceUsd);
    }
    return acc;
  }, null);

  if (lowest === "free" || lowest === null) {
    return { price: "0", priceCurrency: "USD" };
  }
  return { price: String(lowest), priceCurrency: "USD" };
}

export function softwareApplicationSchema(tool: Tool): JsonLd {
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const image = `${SITE_URL}/tools/${tool.slug}/opengraph-image`;
  const offer = priceFromTool(tool);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: tool.name,
    url,
    image,
    description: tool.description,
    applicationCategory: CATEGORY_LABELS[tool.category],
    applicationSubCategory: "Artificial Intelligence",
    operatingSystem: "Web",
    featureList: tool.features.join(", "),
    softwareVersion: String(tool.launchYear),
    sameAs: tool.websiteUrl,
    offers: {
      "@type": "Offer",
      ...offer,
      url: tool.affiliateUrl ?? tool.websiteUrl,
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(
  name: string,
  url: string,
  tools: Tool[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/tools/${tool.slug}`,
      name: tool.name,
    })),
  };
}

export function articleSchema(input: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    image: input.image ?? `${SITE_URL}/icon`,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    mainEntityOfPage: input.url,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function jsonLdString(...schemas: JsonLd[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

export function siteUrl(): string {
  return SITE_URL;
}
