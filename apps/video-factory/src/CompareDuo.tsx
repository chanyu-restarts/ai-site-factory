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
import type { ToolShortProps, PricingTier } from "./ToolShort";

export type DialogueLine = {
  index: number;
  speaker: "host" | "expert";
  text: string;
  file: string;
  durationSec: number;
  sizeBytes: number;
};

export type CompareDuoProps = {
  toolA: ToolShortProps;
  toolB: ToolShortProps;
  categoryLabel: string;
  lines: DialogueLine[];
  fps: number;
};

export const defaultCompareDuoProps: CompareDuoProps = {
  toolA: {
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "OpenAI's flagship conversational AI assistant.",
    category: "LLM / Chat AI",
    features: ["Chat", "Voice mode", "Image generation"],
    pricing: [{ name: "Free", priceUsd: "free" }, { name: "Plus", priceUsd: 20, perMonth: true }],
    websiteUrl: "https://chatgpt.com",
    pricingModel: "freemium",
  },
  toolB: {
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic's safety-focused frontier assistant.",
    category: "LLM / Chat AI",
    features: ["Chat", "Artifacts", "Projects"],
    pricing: [{ name: "Free", priceUsd: "free" }, { name: "Pro", priceUsd: 20, perMonth: true }],
    websiteUrl: "https://claude.ai",
    pricingModel: "freemium",
  },
  categoryLabel: "LLM / Chat AI",
  lines: [],
  fps: 30,
};

const COLORS = {
  bg1: "#0a0e27",
  bg2: "#141a3a",
  accent: "#06b6d4",
  hostColor: "#ec4899",
  expertColor: "#06b6d4",
  text: "#f8fafc",
  subtle: "#94a3b8",
  border: "#1e293b",
  cardBg: "#0f172a",
};

const formatPrice = (p: PricingTier) => {
  if (p.priceUsd === "free") return "Free";
  if (p.priceUsd === "custom") return "Custom";
  return p.perMonth ? `$${p.priceUsd}/mo` : `$${p.priceUsd}`;
};

export const CompareDuo: React.FC<CompareDuoProps> = ({
  toolA,
  toolB,
  categoryLabel,
  lines,
  fps,
}) => {
  let cursor = 0;
  const lineSegments = lines.map((line) => {
    const startFrame = cursor;
    const durationInFrames = Math.ceil(line.durationSec * fps);
    cursor += durationInFrames;
    return { ...line, startFrame, durationInFrames };
  });

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
          top: "20%",
          right: "-20%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 65%)`,
          filter: "blur(80px)",
        }}
      />

      <Header toolA={toolA} toolB={toolB} categoryLabel={categoryLabel} />
      <Speakers segments={lineSegments} />
      <ComparisonCards toolA={toolA} toolB={toolB} />

      {lineSegments.map((seg) => (
        <Sequence key={seg.index} from={seg.startFrame} durationInFrames={seg.durationInFrames}>
          <Html5Audio src={staticFile(seg.file)} />
          <Caption text={seg.text} speaker={seg.speaker} />
        </Sequence>
      ))}

      {lineSegments.length > 0 ? (
        <Sequence
          from={lineSegments[lineSegments.length - 1].startFrame}
          durationInFrames={lineSegments[lineSegments.length - 1].durationInFrames}
        >
          <CtaBar slug={`${toolA.slug}-vs-${toolB.slug}`} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const Header: React.FC<{ toolA: ToolShortProps; toolB: ToolShortProps; categoryLabel: string }> = ({
  toolA,
  toolB,
  categoryLabel,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 24,
          color: COLORS.accent,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {categoryLabel} Comparison
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.02em" }}>
        {toolA.name} <span style={{ color: COLORS.subtle, fontWeight: 500 }}>vs</span> {toolB.name}
      </div>
    </div>
  );
};

const SpeakerCircle: React.FC<{
  initial: string;
  label: string;
  isActive: boolean;
  color: string;
}> = ({ initial, label, isActive, color }) => {
  const scale = isActive ? 1.0 : 0.85;
  const opacity = isActive ? 1.0 : 0.4;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          fontWeight: 800,
          color: "#ffffff",
          boxShadow: isActive ? `0 0 60px ${color}80` : "none",
        }}
      >
        {initial}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.subtle }}>{label}</div>
    </div>
  );
};

const Speakers: React.FC<{ segments: Array<{ startFrame: number; durationInFrames: number; speaker: string }> }> = ({
  segments,
}) => {
  const frame = useCurrentFrame();
  const current = segments.find((s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames);
  const activeSpeaker = current?.speaker ?? "host";

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 80,
      }}
    >
      <SpeakerCircle
        initial="E"
        label="Host"
        isActive={activeSpeaker === "host"}
        color={COLORS.hostColor}
      />
      <SpeakerCircle
        initial="A"
        label="Expert"
        isActive={activeSpeaker === "expert"}
        color={COLORS.expertColor}
      />
    </div>
  );
};

const ComparisonCards: React.FC<{ toolA: ToolShortProps; toolB: ToolShortProps }> = ({ toolA, toolB }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 460,
        left: 80,
        right: 80,
        display: "flex",
        gap: 40,
        justifyContent: "space-between",
      }}
    >
      <ToolCard tool={toolA} accentColor={COLORS.hostColor} />
      <ToolCard tool={toolB} accentColor={COLORS.expertColor} />
    </div>
  );
};

const ToolCard: React.FC<{ tool: ToolShortProps; accentColor: string }> = ({ tool, accentColor }) => {
  const startingPrice = tool.pricing.find((p) => p.priceUsd !== "custom") ?? tool.pricing[0];
  return (
    <div
      style={{
        flex: 1,
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 16,
        padding: 36,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 8 }}>{tool.name}</div>
      <div style={{ fontSize: 20, color: COLORS.subtle, marginBottom: 24, lineHeight: 1.4 }}>
        {tool.tagline}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: COLORS.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Pricing
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: accentColor }}>
          {startingPrice ? formatPrice(startingPrice) : tool.pricingModel}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, color: COLORS.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Top Features
        </div>
        {tool.features.slice(0, 3).map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor }} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
};

const Caption: React.FC<{ text: string; speaker: string }> = ({ text, speaker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.min(8, fps / 4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideUp = spring({ frame, fps, config: { damping: 18 } });
  const speakerColor = speaker === "host" ? COLORS.hostColor : COLORS.expertColor;
  const speakerLabel = speaker === "host" ? "HOST" : "EXPERT";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 100,
        right: 100,
        opacity,
        transform: `translateY(${(1 - slideUp) * 30}px)`,
      }}
    >
      <div
        style={{
          background: `${COLORS.cardBg}E6`,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `4px solid ${speakerColor}`,
          borderRadius: 12,
          padding: "24px 36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: speakerColor,
            fontWeight: 800,
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          {speakerLabel}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.4, fontWeight: 500 }}>{text}</div>
      </div>
    </div>
  );
};

const CtaBar: React.FC<{ slug: string }> = ({ slug }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 980,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: fade,
      }}
    >
      <div style={{ fontSize: 22, color: COLORS.accent, fontWeight: 700 }}>
        whichaitool.vercel.app/compare/{slug}
      </div>
    </div>
  );
};
