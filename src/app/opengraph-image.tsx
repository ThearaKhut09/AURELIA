import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AURELIA — Rituals for skin and senses";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1C1F26 0%, #2E3442 55%, #4A4F5A 100%)",
          color: "#F7F3EE",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 60,
            border: "2px solid rgba(168,181,162,0.8)",
            marginBottom: 36,
          }}
        ></div>
        <div style={{ display: "flex", fontSize: 72, letterSpacing: 24, marginLeft: 24 }}>
          AURELIA
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#A8B5A2", marginTop: 20 }}>
          Rituals for skin and senses
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "rgba(247,243,238,0.6)", marginTop: 28 }}>
          Phnom Penh · Cambodia
        </div>
      </div>
    ),
    size,
  );
}
