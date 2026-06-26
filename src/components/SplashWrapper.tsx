"use client";

/**
 * SplashWrapper — Mokolo Market / ABJ Tech Agency
 * Fichier unique auto-contenu. Emplacement : src/components/SplashWrapper.tsx
 */

import React, { useEffect, useState } from "react";

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(100, Math.round((elapsed / 2200) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setVisible(false), 600);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const CIRCUMFERENCE = 2 * Math.PI * 40;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;900&display=swap');

        .mm-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(150deg, #B0001A 0%, #D72638 35%, #E8445A 65%, #9A1828 100%);
          overflow: hidden;
          animation: mmSplashIn 0.35s ease both;
        }
        .mm-splash.exit {
          animation: mmSplashOut 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
        }

        /* Lumière haute */
        .mm-light-top {
          position: absolute;
          top: -25%;
          left: -15%;
          width: 65%;
          height: 65%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%);
          pointer-events: none;
        }
        /* Lumière basse */
        .mm-light-bot {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 55%;
          height: 55%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,0,0,0.20) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Particules */
        .mm-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          animation: mmFloat 3s ease-in-out infinite;
        }

        /* Contenu */
        .mm-center {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Logo */
        .mm-logo {
          text-align: center;
          margin-bottom: clamp(24px, 5vw, 40px);
          animation: mmSlideUp 0.5s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .mm-logo-main {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(3rem, 12vw, 6rem);
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
          text-shadow: 0 4px 28px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.2);
        }
        .mm-logo-sub {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(0.85rem, 3.5vw, 1.5rem);
          color: rgba(255,255,255,0.80);
          letter-spacing: 0.35em;
          margin-top: 4px;
          text-transform: uppercase;
        }

        /* Cercle */
        .mm-ring-wrap {
          position: relative;
          width: clamp(100px, 26vw, 130px);
          height: clamp(100px, 26vw, 130px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: mmFadeIn 0.5s 0.15s ease both;
        }
        .mm-ring-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .mm-ring-track { stroke: rgba(255,255,255,0.22); }
        .mm-ring-arc {
          stroke: #fff;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.06s linear;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.5));
        }
        .mm-inner {
          width: 72%;
          height: 72%;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 32%, #FF3A52, #B0001A);
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.15),
            0 8px 32px rgba(0,0,0,0.32),
            inset 0 2px 8px rgba(255,255,255,0.20);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mm-pct {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(1rem, 4.5vw, 1.4rem);
          color: #fff;
          letter-spacing: -0.02em;
        }

        /* Tagline */
        .mm-tagline {
          margin-top: clamp(20px, 4vw, 30px);
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.7rem, 2.5vw, 0.88rem);
          color: rgba(255,255,255,0.62);
          letter-spacing: 0.07em;
          animation: mmFadeIn 0.5s 0.3s ease both;
          text-align: center;
          padding: 0 20px;
        }

        /* Barre */
        .mm-bar-track {
          margin-top: clamp(14px, 3vw, 22px);
          width: clamp(150px, 45vw, 240px);
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.20);
          overflow: hidden;
          animation: mmFadeIn 0.5s 0.4s ease both;
        }
        .mm-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), #fff);
          box-shadow: 0 0 10px rgba(255,255,255,0.55);
          transition: width 0.06s linear;
        }

        /* Badge */
        .mm-badge {
          position: absolute;
          bottom: clamp(14px, 4vw, 28px);
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.6rem, 1.8vw, 0.72rem);
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          animation: mmFadeIn 0.5s 0.55s ease both;
          text-align: center;
        }

        /* Keyframes */
        @keyframes mmSplashIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes mmSplashOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.97); }
        }
        @keyframes mmSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mmFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }
      `}</style>

      <div className={`mm-splash${progress >= 100 ? " exit" : ""}`}>
        <div className="mm-light-top" />
        <div className="mm-light-bot" />

        {/* Particules */}
        {[
          { top:"10%", left:"7%",   w:6,  op:0.18, delay:"0s"    },
          { top:"18%", right:"9%",  w:10, op:0.12, delay:"0.3s"  },
          { top:"50%", left:"4%",   w:5,  op:0.15, delay:"0.5s"  },
          { top:"30%", right:"4%",  w:7,  op:0.13, delay:"0.8s"  },
          { bottom:"20%", left:"12%",  w:8, op:0.14, delay:"0.6s" },
          { bottom:"28%", right:"7%",  w:5, op:0.19, delay:"0.2s" },
        ].map((p,i) => (
          <div
            key={i}
            className="mm-particle"
            style={{
              top:p.top, bottom:(p as {bottom?:string}).bottom,
              left:p.left, right:(p as {right?:string}).right,
              width:p.w, height:p.w,
              opacity:p.op,
              animationDelay:p.delay,
            }}
          />
        ))}

        <div className="mm-center">
          {/* Logo */}
          <div className="mm-logo">
            <div className="mm-logo-main">MOKOLO</div>
            <div className="mm-logo-sub">Market</div>
          </div>

          {/* Cercle de progression */}
          <div className="mm-ring-wrap">
            <svg className="mm-ring-svg" viewBox="0 0 100 100">
              <circle className="mm-ring-track" cx="50" cy="50" r="40" fill="none" strokeWidth="5"/>
              <circle
                className="mm-ring-arc"
                cx="50" cy="50" r="40" fill="none" strokeWidth="5"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="mm-inner">
              <span className="mm-pct">{progress}%</span>
            </div>
          </div>

          <p className="mm-tagline">La marketplace africaine de confiance</p>

          <div className="mm-bar-track">
            <div className="mm-bar-fill" style={{ width:`${progress}%` }} />
          </div>
        </div>

        <div className="mm-badge">ABJ Tech Agency · Yaoundé</div>
      </div>
    </>
  );
}

/* ── Wrapper principal ── */
export default function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!done && <LoadingScreen />}
      <div style={{
        opacity: done ? 1 : 0,
        transition: "opacity 0.45s ease 0.1s",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </>
  );
}
