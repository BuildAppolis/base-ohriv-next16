import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { createMetadata } from "@/lib/metadata";
import { ServerProviders } from "@/components/providers/index";


export const metadata = createMetadata({
  title: {
    template: "%s | Ohriv",
    default: "Ohriv",
  },
  description: "Preview of Ohriv and its features.",
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
        <ServerProviders>{children}</ServerProviders>
      </body>
    </html>
  );
}
