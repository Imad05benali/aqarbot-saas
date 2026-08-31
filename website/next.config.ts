import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/whatsapp/:path*',
        destination: 'http://127.0.0.1:8000/api/whatsapp/:path*', // Proxy to FastAPI Backend
      },
    ];
  },
};

export default nextConfig;
