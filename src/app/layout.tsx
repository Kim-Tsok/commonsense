import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Common Sense — Good to know, Nigeria",
  description:
    "A simple place for useful everyday information in Nigeria. UI prototype with sample content.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
