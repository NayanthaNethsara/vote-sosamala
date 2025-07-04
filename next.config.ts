import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zrnzvzwtqwtqdxwvlrlu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/contestants/**",
      },
    ],
  },
};

export default nextConfig;
