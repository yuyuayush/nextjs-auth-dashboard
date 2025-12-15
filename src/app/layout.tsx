import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";
import VideoCallProvider from "@/components/chat/VideoCallProvider";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FriendHub",
  description: "Connect with friends, chat, and share your world.",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <VideoCallProvider>
          <Navbar session={session} />
          <main>
            {children}
          </main>
          <Footer />
        </VideoCallProvider>
        <Toaster />
      </body>
    </html>
  );
}
