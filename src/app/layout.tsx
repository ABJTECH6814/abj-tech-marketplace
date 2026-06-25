import React from "react";
import type { Metadata } from "next";
import "./globals.css"; // ← CORRECTIF CRITIQUE : sans cet import, Tailwind compilé n'est jamais chargé

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

        {/* Préconnexion Firestore — conservé, sans impact sur le style */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link
          rel="preconnect"
          href="https://firestore.googleapis.com"
          crossOrigin="anonymous"
        />

        {/* ⚠️ SUPPRIMÉ : <script src="https://cdn.tailwindcss.com" defer> et le script
            d'injection de config inline. Ils entraient en conflit avec le Tailwind
            compilé par Next.js/PostCSS et masquaient le vrai bug (import manquant
            de globals.css). Une seule source de Tailwind = celle compilée au build. */}
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
        {children}
      </body>
    </html>
  );
}
