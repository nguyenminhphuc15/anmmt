import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth Flow Demo - Modern Authentication Explained",
  description:
    "Interactive demonstration of Magic Link, OAuth2, and Authorization Code flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Thêm suppressHydrationWarning vào html
    <html
      lang="en"
      className={`${inter.variable} dark antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      {/* Thêm suppressHydrationWarning vào body */}
      <body 
        className="min-h-screen bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}