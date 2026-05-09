import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#7c3aed",
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: -1,
          fontFamily: "system-ui",
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}
