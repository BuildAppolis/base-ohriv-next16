import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { createMetadata } from "@/lib/metadata";
import { Providers } from "@/components/providers";

export const metadata = createMetadata({
  title: {
    template: "%s | Base by BuildAppolis",
    default: "Base",
  },
  description: "Base is a powerful boilerplate for building modern web applications.",
  metadataBase: new URL("https://ohriv.com"),
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
