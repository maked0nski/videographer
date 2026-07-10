import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Branded favicon — lime "Y" on the site's near-black background. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "#C3CB00",
        fontSize: 22,
        fontWeight: 700,
      }}
    >
      Y
    </div>,
    { ...size },
  );
}
