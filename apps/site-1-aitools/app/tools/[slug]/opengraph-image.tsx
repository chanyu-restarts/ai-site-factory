import { ImageResponse } from "next/og";
import { TOOLS, TOOLS_BY_SLUG } from "@/lib/data/tools";
import { CATEGORY_LABELS } from "@/lib/types";

export const contentType = "image/png";
export const size = { width: 1000, height: 1500 };

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const tool = TOOLS_BY_SLUG[params.slug];
  if (!tool) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0b0b10",
            color: "white",
          }}
        />
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 80,
          background:
            "linear-gradient(135deg, #0b0b10 0%, #1a0f3a 50%, #14141c 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 32,
            color: "#a1a1aa",
          }}
        >
          <span style={{ color: "#22d3ee", fontSize: 36 }}>◆</span>
          <span>WhichAITool</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 60,
            paddingBottom: 60,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#7c3aed",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 600,
              marginBottom: 30,
            }}
          >
            {CATEGORY_LABELS[tool.category]}
          </div>
          <div
            style={{
              fontSize: 140,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 40,
              letterSpacing: -2,
            }}
          >
            {tool.name}
          </div>
          <div
            style={{
              fontSize: 44,
              color: "#d4d4d8",
              lineHeight: 1.3,
            }}
          >
            {tool.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            color: "#a1a1aa",
            borderTop: "2px solid #27272a",
            paddingTop: 40,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <span
              style={{
                background: "#22d3ee",
                color: "#0b0b10",
                padding: "12px 28px",
                borderRadius: 999,
                textTransform: "uppercase",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {tool.pricingModel}
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>
              Since {tool.launchYear}
            </span>
          </div>
          <span style={{ fontSize: 26 }}>whichaitool.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
