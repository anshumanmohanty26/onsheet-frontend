import { AuthProvider } from "@/lib/auth/AuthContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnSheet — The Modern Spreadsheet",
  description:
    "OnSheet is a powerful, collaborative spreadsheet built for teams. Real-time collaboration, 150+ formulas, and AI-powered data analysis.",
  metadataBase: new URL("https://onsheet.app"),
  icons: {
    icon: "/onsheet.svg",
    shortcut: "/onsheet.svg",
    apple: "/onsheet.svg",
  },
  openGraph: {
    title: "OnSheet — The Modern Spreadsheet",
    description: "Collaborative spreadsheets, reimagined.",
    type: "website",
    images: [{ url: "/onsheet.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
