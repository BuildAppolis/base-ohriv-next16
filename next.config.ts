import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/demos",
  //       permanent: false,
  //     },
  //   ];
  // },
  typedRoutes: true,
};

// Setup watcher when config loads

export default nextConfig;
