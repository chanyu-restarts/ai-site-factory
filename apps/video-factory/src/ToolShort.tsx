import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type PricingTier = {
  name: string;
  priceUsd: number | "free" | "custom";
  perMonth?: boolean;
  notes?: string;
};

export type ToolShortProps = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  features: string[];
  pricing: PricingTier[];
  websiteUrl: string;
  pricingModel: "free" | "freemium" | "paid";
  audioFile?: string;
};

export const defaultToolShortProps: ToolShortProps = {
  slug: "chatgpt",
  name: "ChatGPT",
  tagline: "OpenAI's flagship conversational AI assistant.",
  category: "LLM / Chat AI",
  features: ["Chat", "Voice mode", "Image generation"],
  pricing: [
    { name: "Free", priceUsd: "free" },
    { name: "Plus", priceUsd: 20, perMonth: true },
  ],
  websiteUrl: "https://chatgpt.com",
  pricingModel: "freemium",
};

const COLORS = {
  bg1: "#0a0e27",
  bg2: "#141a3a",
  accent1: "#06b6d4",
  accent2: "#0891b2",
  text: "#f8fafc",
  subtle: "#94a3b8",
  border: "#1e293b",
};

const formatPrice = (p: ToolShortProps["pricing"][number]) => {
  if (p.priceUsd === "free") return "Free";
  if (p.priceUsd === "custom") return "Custom";
  return p.perMonth ? `$${p.priceUsd}/mo` : `$${p.priceUsd}`;
};

export const ToolShort: React.FC<ToolShortProps> = ({
  name,
  tagline,
  category,
  features,
  pricing,
  pricingModel,
  audioFile,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 100%)`,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-30%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent1}1A 0%, transparent 65%)`,
          filter: "blur(60px)",
        }}
      />

      {audioFile ? <Html5Audio src={staticFile(audioFile)} /> : null}

      <Sequence from={0} durationInFrames={90}>
        <BrandIntro />
      </Sequence>
      <Sequence from={90} durationInFrames={210}>
        <ToolHero name={name} tagline={tagline} category={category} />
      </Sequence>
      <Sequence from={300} durationInFrames={360}>
        <FeaturesScene features={features} />
      </Sequence>
      <Sequence from={660} durationInFrames={240}>
        <CtaScene pricing={pricing} pricingModel={pricingModel} name={name} />
      </Sequence>
    </AbsoluteFill>
  );
};

const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [60, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: "-0.04em",
        }}
      >
        WhichAITool
      </div>
      <div style={{ marginTop: 20, fontSize: 32, color: COLORS.subtle, fontWeight: 500 }}>
        Tool of the day
      </div>
    </AbsoluteFill>
  );
};

const ToolHero: React.FC<{ name: string; tagline: string; category: string }> = ({
  name,
  tagline,
  category,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nameScale = spring({ frame, fps, config: { damping: 10 } });
  const taglineOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const categoryOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          fontSize: 32,
          color: COLORS.accent1,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 32,
          opacity: categoryOpacity,
        }}
      >
        {category}
      </div>
      <div
        style={{
          fontSize: 200,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          textAlign: "center",
          transform: `scale(${nameScale})`,
          lineHeight: 1,
          marginBottom: 48,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 42,
          color: COLORS.subtle,
          textAlign: "center",
          fontWeight: 500,
          lineHeight: 1.3,
          maxWidth: 900,
          opacity: taglineOpacity,
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};

const FeaturesScene: React.FC<{ features: string[] }> = ({ features }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleFeatures = features.slice(0, 5);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: 100 }}>
      <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 80, opacity: titleOpacity }}>
        Key Features
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}>
        {visibleFeatures.map((feat, i) => {
          const start = 30 + i * 50;
          const itemY = interpolate(frame, [start, start + 25], [80, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemOpacity = interpolate(frame, [start, start + 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                transform: `translateY(${itemY}px)`,
                opacity: itemOpacity,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: COLORS.accent1,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>{feat}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{
  pricing: ToolShortProps["pricing"];
  pricingModel: ToolShortProps["pricingModel"];
  name: string;
}> = ({ pricing, pricingModel, name }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slideUp = spring({ frame, fps, config: { damping: 15 } });
  const ctaScale = spring({ frame: frame - 120, fps, config: { damping: 8 } });
  const startingPrice = pricing.find((p) => p.priceUsd !== "custom") ?? pricing[0];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        transform: `translateY(${(1 - slideUp) * 100}px)`,
      }}
    >
      <div
        style={{
          fontSize: 36,
          color: COLORS.subtle,
          fontWeight: 600,
          marginBottom: 24,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        Pricing
      </div>
      <div style={{ fontSize: 110, fontWeight: 900, marginBottom: 16 }}>
        {startingPrice ? formatPrice(startingPrice) : pricingModel}
      </div>
      <div
        style={{ fontSize: 30, color: COLORS.subtle, marginBottom: 80, textTransform: "capitalize" }}
      >
        {pricingModel} tier available
      </div>
      <div
        style={{
          padding: "28px 56px",
          background: COLORS.accent1,
          color: "#ffffff",
          borderRadius: 18,
          fontSize: 44,
          fontWeight: 800,
          marginBottom: 40,
          transform: `scale(${ctaScale})`,
        }}
      >
        Compare {name}
      </div>
      <div style={{ fontSize: 32, color: COLORS.subtle, fontWeight: 600, marginTop: 16 }}>
        whichaitool.vercel.app
      </div>
    </AbsoluteFill>
  );
};
