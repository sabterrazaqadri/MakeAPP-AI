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
  title: "MakeApp AI - Generate Apps with AI",
  description: "Create stunning web applications instantly with AI. Describe your app in plain English and watch it come to life with React and Tailwind CSS.",
  keywords: ["AI", "app generator", "React", "Tailwind CSS", "web development", "code generation"],
  authors: [{ name: "MakeApp AI" }],
  creator: "MakeApp AI",
  openGraph: {
    title: "MakeApp AI - Generate Apps with AI",
    description: "Create stunning web applications instantly with AI. Describe your app in plain English and watch it come to life.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MakeApp AI - Generate Apps with AI",
    description: "Create stunning web applications instantly with AI. Describe your app in plain English and watch it come to life.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased animated-gradient min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
