import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/workspace/workspace.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AutoFlow",
  description: "Run workflows and save reports of your high-priority tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} font-sans`}
    >
      <body>{children}</body>
    </html>
  );
}
