import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "고구마마켓 - 따뜻한 동네 중고거래",
  description: "우리 동네 이웃과 함께하는 따뜻한 중고거래 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 bg-white py-6 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
            🍠 고구마마켓 · 따뜻한 동네 중고거래
          </div>
        </footer>
      </body>
    </html>
  );
}
