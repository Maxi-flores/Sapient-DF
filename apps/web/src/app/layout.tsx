import type { Metadata } from "next";
import { FundanceTransition } from "@/components/FundanceTransition";
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
        {/* Lottie star-burst overlay fires on every route change */}
        <FundanceTransition />
        {children}
      </body>
    </html>
  );
}
