import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product images are URL-based (local /public placeholders now; Cloudinary /
    // Vercel Blob URLs in production). Restrict remotePatterns to your own
    // asset hostnames before going live if you prefer a stricter policy.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
