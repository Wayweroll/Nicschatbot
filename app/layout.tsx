import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Course Chatbot MVP",
  description: "Subject-scoped course knowledge chatbot"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
