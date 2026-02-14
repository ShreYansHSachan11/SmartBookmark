import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bookmark Manager",
  description: "Manage your bookmarks with real-time synchronization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
