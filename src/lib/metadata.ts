import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://base-ohriv-next16.vercel.app";

  return {
    ...override,
    openGraph: {
      title: override.title ?? "OHRIV Platform",
      description: override.description ?? "Advanced HR and business intelligence platform",
      url: baseUrl,
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
    metadataBase: new URL(baseUrl),
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? new URL("http://localhost:3000")
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL("https://base-ohriv-next16.vercel.app");
