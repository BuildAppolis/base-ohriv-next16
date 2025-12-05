import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { Providers } from "@/components/providers";


export const metadata = createMetadata({
  title: {
    template: "%s | Ohriv",
    default: "Ohriv",
  },
  description: "Preview of Ohriv and its features.",
  metadataBase: new URL(`${baseUrl}`),
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
