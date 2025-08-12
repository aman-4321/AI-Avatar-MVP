import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Studio",
  description: "Create avatars, synthesize voices, and render videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <a className="font-semibold" href="/studio">
              AI Studio
            </a>
            <a
              className="text-sm text-gray-600 hover:text-black"
              href="/avatars"
            >
              Avatars
            </a>
            <a
              className="text-sm text-gray-600 hover:text-black"
              href="/voices"
            >
              Voices
            </a>
            <a
              className="text-sm text-gray-600 hover:text-black"
              href="/videos"
            >
              Videos
            </a>
            <div className="ml-auto flex items-center gap-3">
              <a
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
                href="/avatars/create"
              >
                New Avatar
              </a>
              <a
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
                href="/videos/create"
              >
                New Video
              </a>
            </div>
          </div>
        </nav>
        <Toaster position="top-right" />
        <div className="pt-2">{children}</div>
      </body>
    </html>
  );
}
