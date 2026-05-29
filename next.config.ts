import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiProxyTarget}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
      {
        source: "/doc",
        destination: `${apiProxyTarget}/doc`,
      },
      {
        source: "/docs",
        destination: `${apiProxyTarget}/docs`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
