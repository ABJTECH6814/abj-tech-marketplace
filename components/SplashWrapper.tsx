"use client";

/**
 * SplashWrapper — ABJ Tech / Mokolo Market
 * ─────────────────────────────────────────
 * À placer dans app/layout.tsx autour de {children}.
 *
 * INTÉGRATION :
 *   1. Copier loading.tsx → app/loading-screen/LoadingScreen.tsx
 *   2. Dans app/layout.tsx, remplacer <body>{children}</body> par :
 *      <body><SplashWrapper>{children}</SplashWrapper></body>
 *   3. Importer ce fichier : import SplashWrapper from "@/components/SplashWrapper"
 */

import React, { useEffect, useState } from "react";
import LoadingScreen from "@/app/loading-screen/LoadingScreen"; // ← adapte le chemin

export default function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Le splash dure ~2.8s (2s chargement + 0.8s animation sortie)
    const timer = setTimeout(() => setDone(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {!done && <LoadingScreen />}
      <div
        style={{
          opacity: done ? 1 : 0,
          transition: "opacity 0.4s ease 0.1s",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
