"use client";

/**
 * SplashWrapper — Mokolo Market / ABJ Tech Agency
 * src/components/SplashWrapper.tsx
 */

import React, { useEffect, useState } from "react";

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Bloque le scroll du body pendant le splash
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const pct = Math.min(100, Math.round(((ts - start) / 2200) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(animate);
      } else {
        // Démarre l'animation de sortie
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 600);
        }, 250);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const CIRC = 2 * Math.PI * 40;

  return (
    <>
      <style>{`
        .mm-splash {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(150deg, #B0001A 0%, #D72638 38%, #E8445A 68%, #9A1828 100%);
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.55s ease, transform 0.55s ease;
          transform: scale(1);
        }
        .mm-splash.mm-exit {
          opacity: 0;
          transform: scale(0.96);
          pointer-events: none;
        }

        .mm-light-1 {
          position: absolute;
          top: -30%; left: -20%;
          width: 70%; height: 70%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 68%);
          pointer-events: none;
        }
        .mm-light-2 {
          position: absolute;
          bottom: -22%; right: -12%;
          width: 58%; height: 58%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,0,0,0.22) 0%, transparent 68%);
          pointer-events: none;
        }

        .mm-particle {
          position: absolute;
          border-radius: 50%;
          background: #fff;
          animation: mmFloat 3s ease-in-out infinite;
        }

        .mm-body {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 0 16px;
          box-sizing: border-box;
        }

        .mm-logo {
          text-align: center;
          margin-bottom: clamp(20px, 5vh, 40px);
          animation: mmUp 0.55s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .mm-logo-main {
          font-family: 'Montserrat', -apple-system, sans-serif;
          font-weight: 900;
          font-size: clamp(2.6rem, 13vw, 6rem);
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
          text-shadow: 0 4px 24px rgba(0,0,0,0.28);
        }
        .mm-logo-sub {
          font-family: 'Montserrat', -apple-system, sans-serif;
          font-weight: 500;
          font-size: clamp(0.8rem, 3.8vw, 1.5rem);
          color: rgba(255,255,255,0.78);
          letter-spacing: 0.34em;
          margin-top: 4px;
          text-transform: uppercase;
        }

        .mm-ring {
          position: relative;
          width: clamp(90px, 24vw, 124px);
          height: clamp(90px, 24vw, 124px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: mmFade 0.4s 0.15s ease both;
          flex-shrink: 0;
        }
        .mm-ring svg {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          transform: rotate(-90deg);
        }
        .mm-ring-track { stroke: rgba(255,255,255,0.22); }
        .mm-ring-arc {
          stroke: #fff;
          stroke-linecap: round;
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.45));
          transition: stroke-dashoffset 0.06s linear;
        }
        .mm-inner {
          width: 70%; height: 70%;
          border-radius: 50%;
          background: radial-gradient(circle at 33% 33%, #FF3A52, #AA0018);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.14),
                      0 6px 28px rgba(0,0,0,0.30),
                      inset 0 2px 8px rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mm-pct {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(0.9rem, 4vw, 1.35rem);
          color: #fff;
          letter-spacing: -0.02em;
        }

        .mm-tagline {
          margin-top: clamp(16px, 3.5vh, 28px);
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.68rem, 2.4vw, 0.86rem);
          color: rgba(255,255,255,0.60);
          letter-spacing: 0.07em;
          text-align: center;
          animation: mmFade 0.4s 0.28s ease both;
          max-width: 280px;
        }

        .mm-bar {
          margin-top: clamp(12px, 2.5vh, 20px);
          width: clamp(140px, 44vw, 230px);
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.18);
          overflow: hidden;
          animation: mmFade 0.4s 0.36s ease both;
        }
        .mm-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, rgba(255,255,255,0.55), #fff);
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          transition: width 0.06s linear;
        }

        .mm-badge {
          position: absolute;
          bottom: max(14px, env(safe-area-inset-bottom, 14px));
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.58rem, 1.7vw, 0.70rem);
          color: rgba(255,255,255,0.36);
          letter-spacing: 0.13em;
          text-transform: uppercase;
          animation: mmFade 0.4s 0.5s ease both;
          text-align: center;
        }

        @keyframes mmUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mmFade {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes mmFloat {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }
      `}</style>

      <div className={`mm-splash${exiting ? " mm-exit" : ""}`}>
        <div className="mm-light-1" />
        <div className="mm-light-2" />

        {[
          { top:"9%",    left:"7%",    s:6,  o:0.17, d:"0s"    },
          { top:"17%",   right:"8%",   s:10, o:0.11, d:"0.3s"  },
          { top:"48%",   left:"3.5%",  s:5,  o:0.15, d:"0.5s"  },
          { top:"28%",   right:"3.5%", s:7,  o:0.12, d:"0.8s"  },
          { bottom:"22%",left:"11%",   s:8,  o:0.14, d:"0.6s"  },
          { bottom:"30%",right:"6%",   s:5,  o:0.18, d:"0.2s"  },
        ].map((p, i) => (
          <div
            key={i}
            className="mm-particle"
            style={{
              top: (p as {top?:string}).top,
              bottom: (p as {bottom?:string}).bottom,
              left: (p as {left?:string}).left,
              right: (p as {right?:string}).right,
              width: p.s, height: p.s,
              opacity: p.o,
              animationDelay: p.d,
            }}
          />
        ))}

        <div className="mm-body">
          <div className="mm-logo">
            <div className="mm-logo-main">MOKOLO</div>
            <div className="mm-logo-sub">Market</div>
          </div>

          <div className="mm-ring">
            <svg viewBox="0 0 100 100">
              <circle className="mm-ring-track" cx="50" cy="50" r="40" fill="none" strokeWidth="5.5" />
              <circle
                className="mm-ring-arc"
                cx="50" cy="50" r="40" fill="none" strokeWidth="5.5"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (progress / 100) * CIRC}
              />
            </svg>
            <div className="mm-inner">
              <span className="mm-pct">{progress}%</span>
            </div>
          </div>

          <p className="mm-tagline">La marketplace africaine de confiance</p>

          <div className="mm-bar">
            <div className="mm-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mm-badge">ABJ Tech Agency · Yaoundé</div>
      </div>
    </>
  );
}

export default function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showApp, setShowApp] = useState(false);

  const handleDone = () => {
    setShowSplash(false);
    setShowApp(true);
  };

  return (
    <>
      {showSplash && <LoadingScreen onDone={handleDone} />}
      <div
        style={{
          opacity: showApp ? 1 : 0,
          transition: "opacity 0.4s ease",
          minHeight: "100vh",
          visibility: showApp ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </>
  );
}
