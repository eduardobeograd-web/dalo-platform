import { ImageResponse } from "next/og";

export const alt = "DALO travel eSIM recommendations";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#10233a",
          background:
            "linear-gradient(135deg, #f7fafc 0%, #dbeafe 55%, #a5f3fc 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "#1738a0",
          }}
        >
          DALO
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
            }}
          >
            The right eSIM for your trip.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              color: "#334155",
            }}
          >
            Matched to your destination, trip length and data usage.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
