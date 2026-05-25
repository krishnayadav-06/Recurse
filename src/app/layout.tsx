import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recurse - Spaced Repetition for LeetCode",
  description: "Recurse schedules your LeetCode reviews using SM-2 — so you stop re-solving the same problems from scratch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-ink font-sans antialiased selection:bg-signal/20">
        {children}
      </body>
    </html>
  );
}
