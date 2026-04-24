import type { Metadata } from "next";
import { FundanceTransition } from "@/components/FundanceTransition";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapient — Knowledge Base",
  description: "Sapient Obsidian-powered web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Fixed parallax starfield — sits behind all content */}
        <StarfieldBackground />
        {/* Lottie star-burst overlay fires on every route change */}
        <FundanceTransition />
        {children}
        {/* WhatsApp floating action button */}
        <WhatsAppFAB />
      </body>
    </html>
  );
}

