"use client";

/**
 * SplashWrapper — Mokolo Market / ABJ Tech Agency
 * Fichier unique auto-contenu : LoadingScreen + Wrapper fusionnés.
 * Emplacement : components/SplashWrapper.tsx
 * Usage dans layout.tsx : import SplashWrapper from "@/components/SplashWrapper"
 */

import React, { useEffect, useState } from "react";

/* ─────────────────────────────────────────
   SPLASH SCREEN (composant interne)
───────────────────────────────────────── */
function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"enter" | "loading" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("loading"), 400);

    let start: number | null = null;
    let raf: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("exit"), 300);
      }
    }

    const rafStart = setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(rafStart);
      cancelAnimationFrame(raf);
    };
  }, []);

  const CIRCUMFERENCE = 2 * Math.PI * 44;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div
      aria-live="polite"
      aria-label="Chargement de Mokolo Market"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #C0001A 0%, #D72638 40%, #E8445A 70%, #A51C2B 100%)",
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "enter" ? "scale(1.04)" : "scale(1)",
        transition:
          phase === "exit"
            ? "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)"
            : phase === "enter"
            ? "opacity 0.4s ease, transform 0.4s ease"
            : "none",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Lumières ambiantes */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "-20%",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-15%",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,0,0,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Particules flottantes */}
      {(
        [
          { top: "12%", left: "8%", size: 6, opacity: 0.18, delay: "0s" },
          { top: "20%", right: "10%", size: 10, opacity: 0.12, delay: "0.3s" },
          { bottom: "18%", left: "15%", size: 8, opacity: 0.15, delay: "0.6s" },
          { bottom: "25%", right: "8%", size: 5, opacity: 0.2, delay: "0.15s" },
          { top: "55%", left: "5%", size: 4, opacity: 0.14, delay: "0.45s" },
          { top: "35%", right: "5%", size: 7, opacity: 0.13, delay: "0.8s" },
        ] as Array<{
          top?: string;
          bottom?: string;
          left?: string;
          right?: string;
          size: number;
          opacity: number;
          delay: string;
        }>
      ).map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "white",
            opacity: p.opacity,
            animation: `mmFloat 3s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Contenu central */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
            animation: "mmSlideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
              fontWeight: 900,
              fontSize: "clamp(2.8rem, 10vw, 5.5rem)",
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              lineHeight: 1,
              textShadow:
                "0 4px 24px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            MOKOLO
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.95rem, 3.5vw, 1.55rem)",
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "0.32em",
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            Market
          </div>
        </div>

        {/* Cercle de progression */}
        <div
          style={{
            position: "relative",
            width: "clamp(96px, 22vw, 120px)",
            height: "clamp(96px, 22vw, 120px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "mmFadeIn 0.5s 0.2s ease both",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              transform: "rotate(-90deg)",
            }}
          >
            {/* Piste fond */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.20)"
              strokeWidth="5"
            />
            {/* Arc de progression */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.08s linear" }}
            />
          </svg>

          {/* Intérieur rouge */}
          <div
            style={{
              width: "74%",
              height: "74%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 35%, #FF3A52, #C0001A)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.28), inset 0 2px 8px rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily:
                  "var(--font-heading, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "clamp(1rem, 4vw, 1.35rem)",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            marginTop: 28,
            fontFamily: "var(--font-body, 'Inter', sans-serif)",
            fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.06em",
            animation: "mmFadeIn 0.6s 0.4s ease both",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          La marketplace africaine de confiance
        </p>

        {/* Barre linéaire */}
        <div
          style={{
            marginTop: 20,
            width: "clamp(140px, 40vw, 220px)",
            height: 3,
            borderRadius: 99,
            background: "rgba(255,255,255,0.18)",
            overflow: "hidden",
            animation: "mmFadeIn 0.5s 0.5s ease both",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7), #FFFFFF)",
              borderRadius: 99,
              transition: "width 0.08s linear",
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        </div>
      </div>

      {/* Badge bas de page */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(16px, 4vh, 32px)",
          fontFamily: "var(--font-body, 'Inter', sans-serif)",
          fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
          color: "rgba(255,255,255,0.40)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation: "mmFadeIn 0.6s 0.7s ease both",
        }}
      >
        ABJ Tech Agency · Yaoundé
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes mmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mmFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   SPLASH WRAPPER (export principal)
───────────────────────────────────────── */
export default function SplashWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // 2s progression + 0.3s pause + 0.55s fade-out = ~2.85s
    const timer = setTimeout(() => setDone(true), 2850);
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
