import type { Metadata } from "next";
import { Inter, Michroma } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const michroma = Michroma({
  variable: "--font-michroma",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreatorDNA - AI Strategist for YouTube Creators",
  description: "The complete intelligence platform for YouTube creators. Decode algorithms, trace viral patterns, detect trends, and secure views in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${michroma.variable}`}>
      <body>{children}</body>
    </html>
  );
}
