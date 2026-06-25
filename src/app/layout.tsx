import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
    <html lang="fr">
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
        style={{
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: "#F9F9F9",
          minHeight: "100vh",
        }}
      >
        {/* AuthProvider encapsule toute l'app : SidebarLeft, page d'accueil,
            et plus tard /dashboard, /panier, /auth y auront tous accès via useAuth() */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
