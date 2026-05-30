import {
  AbsoluteFill,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type DialogueShortLine = {
  index: number;
  speaker: "A" | "B";
  text: string;
  file: string;
  durationSec: number;
};

export type DialogueShortProps = {
  slug: string;
  name: string;
  tagline: string;
  categoryLabel: string;
  lines: DialogueShortLine[];
  fps: number;
};

export const INTRO_DURATION_SEC = 1.8;

export const defaultDialogueShortProps: DialogueShortProps = {
  slug: "claude",
  name: "Claude",
  tagline: "Anthropic's safety-focused frontier assistant.",
  categoryLabel: "LLM / Chat AI",
  lines: [
    { index: 0, speaker: "A", text: "Today's AI tool: Claude.", file: "audio/claude/line-00.mp3", durationSec: 2.5 },
    { index: 1, speaker: "B", text: "Ooh, what does it do?", file: "audio/claude/line-01.mp3", durationSec: 2.2 },
  ],
  fps: 30,
};

const COLORS = {
  bg1: "#fef7ed",
  bg2: "#fed7aa",
  speakerA: "#7c3aed",
  speakerB: "#f97316",
  textDark: "#1c1917",
  textMuted: "#78716c",
  cardBg: "#ffffff",
  border: "#e7e5e4",
  bannerBg: "#1c1917",
  bannerText: "#fef7ed",
};

export const DialogueShort: React.FC<DialogueShortProps> = ({
  slug,
  name,
  tagline,
  categoryLabel,
  lines,
  fps,
}) => {
  const introFrames = Math.ceil(INTRO_DURATION_SEC * fps);
  let cursor = introFrames;
  const segments = lines.map((line) => {
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
        color: COLORS.textDark,
      }}
    >
      <Sequence from={0} durationInFrames={introFrames}>
        <HeroIntro name={name} tagline={tagline} categoryLabel={categoryLabel} />
      </Sequence>

      <Sequence from={introFrames} durationInFrames={Math.max(cursor - introFrames, 1)}>
        <TopBanner name={name} categoryLabel={categoryLabel} />
        <Characters segments={segments} introFrames={introFrames} />
      </Sequence>

      {segments.map((seg) => (
        <Sequence key={seg.index} from={seg.startFrame} durationInFrames={seg.durationInFrames}>
          <Html5Audio src={staticFile(seg.file)} />
          <Caption text={seg.text} speaker={seg.speaker} />
        </Sequence>
      ))}

      <Sequence from={introFrames} durationInFrames={Math.max(cursor - introFrames, 1)}>
        <CtaBar slug={slug} />
      </Sequence>
    </AbsoluteFill>
  );
};

const HeroIntro: React.FC<{ name: string; tagline: string; categoryLabel: string }> = ({
  name,
  tagline,
  categoryLabel,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameScale = interpolate(frame, [0, 20], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontSize: 36,
          color: COLORS.textMuted,
          fontWeight: 800,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        Today's AI Tool
      </div>
      <div
        style={{
          fontSize: 200,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          marginBottom: 40,
          textAlign: "center",
          transform: `scale(${nameScale})`,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 36,
          color: COLORS.textDark,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 920,
          marginBottom: 36,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          padding: "14px 32px",
          background: COLORS.bannerBg,
          color: COLORS.bannerText,
          borderRadius: 999,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {categoryLabel}
      </div>
    </AbsoluteFill>
  );
};

const TopBanner: React.FC<{ name: string; categoryLabel: string }> = ({ name, categoryLabel }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 50,
        right: 50,
        background: COLORS.bannerBg,
        color: COLORS.bannerText,
        padding: "26px 40px",
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
        opacity,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {name}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        {categoryLabel}
      </div>
    </div>
  );
};

const FADE_FRAMES = 6;

function computeActiveness(
  frame: number,
  segments: Array<{ startFrame: number; durationInFrames: number; speaker: "A" | "B" }>,
  speakerName: "A" | "B",
): number {
  let maxActiveness = 0;
  for (const seg of segments) {
    if (seg.speaker !== speakerName) continue;
    const start = seg.startFrame;
    const end = seg.startFrame + seg.durationInFrames;
    if (frame >= start - FADE_FRAMES && frame < end + FADE_FRAMES) {
      const fadeIn = Math.min(1, (frame - (start - FADE_FRAMES)) / FADE_FRAMES);
      const fadeOut = Math.min(1, (end + FADE_FRAMES - frame) / FADE_FRAMES);
      maxActiveness = Math.max(maxActiveness, Math.min(fadeIn, fadeOut));
    }
  }
  return maxActiveness;
}

const Character: React.FC<{
  name: "A" | "B";
  side: "left" | "right";
  activeness: number;
}> = ({ name, side, activeness }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Calm bounce: 3px amplitude, 0.7Hz frequency for subtle natural motion
  const bounceAmplitude = 3 * activeness;
  const bounce = Math.sin((frame / fps) * 2 * Math.PI * 0.7) * bounceAmplitude;
  const scale = interpolate(activeness, [0, 1], [0.93, 1.0]);
  const opacity = interpolate(activeness, [0, 1], [0.5, 1.0]);
  const offsetX = side === "left" ? -8 : 8;

  return (
    <div
      style={{
        position: "absolute",
        top: 320,
        [side]: 80,
        width: 320,
        height: 580,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        transform: `translate(${offsetX}px, ${bounce}px) scale(${scale})`,
        transformOrigin: side === "left" ? "left bottom" : "right bottom",
        opacity,
      }}
    >
      <Img
        src={staticFile(`characters/${name}/pose.png`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "bottom center",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
        }}
      />
    </div>
  );
};

const Characters: React.FC<{
  segments: Array<{ startFrame: number; durationInFrames: number; speaker: "A" | "B" }>;
  introFrames: number;
}> = ({ segments, introFrames }) => {
  const frame = useCurrentFrame();
  // Inside this Sequence, useCurrentFrame() returns frame relative to sequence start.
  // segments use absolute composition frames, so shift them down by introFrames for lookup.
  const localSegments = segments.map((s) => ({
    ...s,
    startFrame: s.startFrame - introFrames,
  }));
  const activenessA = computeActiveness(frame, localSegments, "A");
  const activenessB = computeActiveness(frame, localSegments, "B");

  // B on left, A on right
  return (
    <>
      <Character name="B" side="left" activeness={activenessB} />
      <Character name="A" side="right" activeness={activenessA} />
    </>
  );
};

const Caption: React.FC<{ text: string; speaker: "A" | "B" }> = ({ text, speaker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, Math.min(8, fps / 4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speakerColor = speaker === "A" ? COLORS.speakerA : COLORS.speakerB;
  const speakerLabel = speaker === "A" ? "A" : "B";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 320,
        left: 60,
        right: 60,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `10px solid ${speakerColor}`,
          borderRadius: 24,
          padding: "44px 52px",
          boxShadow: "0 16px 56px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: speakerColor,
            fontWeight: 900,
            letterSpacing: "0.3em",
            marginBottom: 16,
          }}
        >
          {speakerLabel}
        </div>
        <div style={{ fontSize: 60, lineHeight: 1.3, fontWeight: 700, color: COLORS.textDark }}>
          {text}
        </div>
      </div>
    </div>
  );
};

const CtaBar: React.FC<{ slug: string }> = ({ slug }) => {
  void slug;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "16px 36px",
          background: COLORS.bannerBg,
          color: COLORS.bannerText,
          borderRadius: 999,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "0.05em",
        }}
      >
        whichaitool.vercel.app
      </div>
    </div>
  );
};
