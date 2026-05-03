export type PricingTier = {
  name: string;
  priceUsd: number | "free" | "custom";
  perMonth?: boolean;
  notes?: string;
};

export type ToolCategory =
  | "llm"
  | "code-ai"
  | "image-gen"
  | "video-gen"
  | "audio-voice"
  | "productivity"
  | "marketing-copy"
  | "avatar"
  | "automation"
  | "presentation"
  | "research";

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  pricingModel: "free" | "freemium" | "paid";
  pricing: PricingTier[];
  features: string[];
  pros: string[];
  cons: string[];
  websiteUrl: string;
  affiliateUrl?: string;
  launchYear: number;
  bestFor: string[];
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  "llm": "LLM / Chat AI",
  "code-ai": "Code AI",
  "image-gen": "Image Generation",
  "video-gen": "Video Generation",
  "audio-voice": "Audio & Voice",
  "productivity": "Productivity",
  "marketing-copy": "Marketing & Copy",
  "avatar": "AI Avatar",
  "automation": "Automation",
  "presentation": "Presentation",
  "research": "Research",
};
