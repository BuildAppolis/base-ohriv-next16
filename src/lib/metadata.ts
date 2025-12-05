import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL.startsWith('http')
          ? process.env.NEXT_PUBLIC_APP_URL
          : `https://${process.env.NEXT_PUBLIC_APP_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : undefined;

  const metadata: Metadata = {
    ...override,
    openGraph: {
      title: override.title ?? "OHRIV Platform",
      description: override.description ?? "Advanced HR and business intelligence platform",
      images: [
        {
          url: "/OG_IMAGE.png",
          width: 1200,
          height: 630,
          alt: "OHRIV Platform",
        },
      ],
      siteName: "OHRIV",
      type: "website",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@buildappolis",
      title: override.title ?? "OHRIV Platform",
      description: override.description ?? "Advanced HR and business intelligence platform",
      images: ["/OG_IMAGE.png"],
      ...override.twitter,
    },
  };

  // Only add URL-dependent metadata if baseUrl is available
  if (baseUrl) {
    if (!metadata.openGraph) metadata.openGraph = {};
    metadata.openGraph.url = baseUrl;

    metadata.metadataBase = new URL(baseUrl);
  }

  return metadata;
}

export const baseUrl: URL | undefined =
  process.env.NODE_ENV === "development"
    ? new URL("http://localhost:3000")
    : process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL.startsWith('http')
          ? process.env.NEXT_PUBLIC_APP_URL
          : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
      : process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined;
