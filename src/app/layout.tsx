import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Poetsen_One } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Square Fruit - Magical Maths Game",
  description: "A fun and magical maths game for kids",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#ffc0e3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const poetsenOne = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poetsen",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="min-h-[100dvh] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      <Analytics />
      <body className={`${poetsenOne.variable} font-poetsen text-foreground`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
