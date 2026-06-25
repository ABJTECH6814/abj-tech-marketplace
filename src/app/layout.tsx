import type { Metadata } from "next";
import React from "react";

// Utilisation des polices système hautement optimisées ou chargées sans CLS (Cumulative Layout Shift)
export const metadata: Metadata = {
  title: {
    default: "MOKOLO Market | Plateforme E-Commerce B2B & B2C Cameroun",
    template: "%s | MOKOLO Market"
  },
  description: "Marché centralisé africain propulsé par ABJ Tech. Achetez et vendez en toute sécurité via MTN MoMo, Orange Money. Système de séquestre garanti.",
  keywords: ["Mokolo Market", "ABJ Tech", "E-commerce Cameroun", "Achat en ligne Douala Yaoundé", "MTN MoMo", "Orange Money", "Grossiste B2B Afrique"],
  authors: [{ name: "Agoume Berthol Joël (Black ABJ)", url: "https://abjtech.com" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mokolo-market.vercel.app"),
  
  // OpenGraph pour optimiser l'affichage sémantique des liens partagés sur WhatsApp, Facebook et TikTok
  openGraph: {
    title: "MOKOLO Market | Serveur Central E-Commerce",
    description: "Vos articles visibles instantanément sur toute la plateforme. Transactions sécurisées par séquestre mobile.",
    url: "/",
    siteName: "MOKOLO Market",
    locale: "fr_CM",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Image de couverture de la marque dans public/
        width: 1200,
        height: 630,
        alt: "Aperçu de la plateforme MOKOLO Market"
      }
    ]
  },
  // Twitter / X Cards
  twitter: {
    card: "summary_large_image",
    title: "MOKOLO Market",
    description: "E-Commerce de confiance propulsé par ABJ Tech Core.",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Préchargement des DNS pour accélérer la connexion Firebase au Cameroun */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossorigin="anonymous" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#FFFFFF",
        color: "#0F0F0F",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        boxSizing: "border-box"
      }}>
        {children}
      </body>
    </html>
  );
}
