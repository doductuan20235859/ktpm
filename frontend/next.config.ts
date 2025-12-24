import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001", // Cho phép load ảnh từ port backend
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Cho phép ảnh avatar mặc định cũ của bạn
      },
    ],
  },
};

export default nextConfig;
