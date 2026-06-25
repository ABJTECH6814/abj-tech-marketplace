import React from "react";
import type { Metadata } from "next";

// Définition des métadonnées de la plateforme MOKOLO Market
export const metadata: Metadata = {
  title: "MOKOLO Market | Marketplace B2B & B2C sécurisée au Cameroun",
  description: "Achetez en gros et au détail en toute sécurité. Système de séquestre garanti par AbJ Tech.",
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
        
        {/* Liens de préconnexion corrigés pour TypeScript (Cas critique crossOrigin résolu) */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        
        {/* CDN de secours pour Tailwind au cas où les classes globales compilent mal sur Vercel */}
        <script src="https://cdn.tailwindcss.com" defer></script>
        
        {/* Configuration à la volée des couleurs de la charte graphique MOKOLO Market (AbJ Tech) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.tailwind && tailwind.config && (tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      'mokolo-red': '#E11D48',
                      'mokolo-black': '#0F172A',
                      'mokolo-gray': {
                        50: '#F8FAFC',
                        100: '#F1F5F9',
                        200: '#E2E8F0',
                        600: '#475569'
                      }
                    }
                  }
                }
              })
            `,
          }}
        />
      </head>
      <body 
        style={{
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: "#F8FAFC",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
