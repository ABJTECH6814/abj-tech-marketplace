import React from "react";
import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashWrapper from "@/components/SplashWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOKOLO Market | Marketplace B2B & B2C sécurisée au Cameroun",
  description:
    "Achetez en gros et au détail en toute sécurité. Système de séquestre garanti par AbJ Tech.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${inter.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link
          rel="preconnect"
          href="https://firestore.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="font-body"
        style={{
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: "#F9F9F9",
          minHeight: "100vh",
        }}
      >
        <AuthProvider>
          <SplashWrapper>
            {children}
          </SplashWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
