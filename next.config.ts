import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jnmrmxbbvwbgvwlprxkj.supabase.co",
        pathname: "/storage/v1/object/public/theme-thumbnails/**",
      },
    ],
  },
};

export default nextConfig;
