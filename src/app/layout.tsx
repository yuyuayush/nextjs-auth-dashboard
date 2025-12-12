import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  title: "Auth Dashboard",
  description: "A Next.js app with authentication and dashboard",
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
        <header className="p-4 border-b">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <h1 className="text-xl font-bold">Auth Dashboard</h1>
            </Link>
            <nav className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
