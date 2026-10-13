import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Jay Huang | Senior Frontend & Web Infrastructure Engineer",
  description:
    "Jay Huang 的個人專案成就與技術作品集。專注於 React、TypeScript、Canvas 原生白板、前端效能優化與現代工程基礎設施。",
  keywords: [
    "黃冠傑",
    "Jay Huang",
    "前端工程師",
    "React",
    "TypeScript",
    "Canvas",
    "Web Audio",
    "Turborepo",
    "Docker",
    "Senior Frontend Engineer",
  ],
  authors: [{ name: "Jay Huang" }],
  openGraph: {
    title: "Jay Huang | Senior Frontend & Web Infrastructure Engineer",
    description:
      "專注於現代 Web 架構、前端工程化與效能調優的軟體工程師。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} font-sans h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
