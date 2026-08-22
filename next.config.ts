import type { NextConfig } from "next";

const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
  process.env.GOOGLE_MAPS_API_KEY?.trim() ||
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: googleMapsApiKey,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mazare.vercel.app" }],
        destination: "https://mazare.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
