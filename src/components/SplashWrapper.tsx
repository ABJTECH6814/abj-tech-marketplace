"use client";

import React, { useEffect, useState } from "react";

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    // Bloquer scroll + overflow pendant le splash
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
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
        setTimeout(() => { setExiting(true); setTimeout(onDone, 600); }, 250);
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
          top: 0; left: 0;
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
          /* Empêcher tout scroll */
          touch-action: none;
          overscroll-behavior: none;
        }
        .mm-splash.mm-exit {
          opacity: 0;
          transform: scale(0.96);
          pointer-events: none;
        }
        .mm-splash-light1 {
          position: absolute; top:-30%; left:-20%;
          width:70%; height:70%; border-radius:50%;
          background: radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 68%);
          pointer-events:none;
        }
        .mm-splash-light2 {
          position: absolute; bottom:-22%; right:-12%;
          width:58%; height:58%; border-radius:50%;
          background: radial-gradient(circle, rgba(0,0,0,0.22) 0%, transparent 68%);
          pointer-events:none;
        }
        .mm-splash-particle {
          position: absolute; border-radius:50%; background:#fff;
          animation: mmSplashFloat 3s ease-in-out infinite;
        }
        .mm-splash-body {
          position:relative; z-index:2;
          display:flex; flex-direction:column; align-items:center;
          width:100%; padding:0 20px; box-sizing:border-box;
        }
        .mm-splash-logo {
          text-align:center;
          margin-bottom: clamp(20px,4vh,40px);
          animation: mmSplashUp 0.55s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .mm-splash-main {
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-weight:900;
          font-size: clamp(2.8rem,8vw,5.5rem);
          color:#fff; letter-spacing:0.05em; line-height:1;
          text-shadow: 0 4px 24px rgba(0,0,0,0.28);
        }
        .mm-splash-sub {
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-weight:500;
          font-size: clamp(0.85rem,2.5vw,1.4rem);
          color:rgba(255,255,255,0.78);
          letter-spacing:0.34em; margin-top:4px; text-transform:uppercase;
        }
        .mm-splash-ring {
          position:relative;
          width: clamp(90px,15vw,120px);
          height: clamp(90px,15vw,120px);
          display:flex; align-items:center; justify-content:center;
          animation: mmSplashFade 0.4s 0.15s ease both;
          flex-shrink:0;
        }
        .mm-splash-ring svg {
          position:absolute; inset:0; width:100%; height:100%;
          transform:rotate(-90deg);
        }
        .mm-splash-inner {
          width:70%; height:70%; border-radius:50%;
          background: radial-gradient(circle at 33% 33%, #FF3A52, #AA0018);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.14),
                      0 6px 28px rgba(0,0,0,0.30),
                      inset 0 2px 8px rgba(255,255,255,0.18);
          display:flex; align-items:center; justify-content:center;
        }
        .mm-splash-pct {
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-weight:900;
          font-size: clamp(0.9rem,3vw,1.3rem);
          color:#fff; letter-spacing:-0.02em;
        }
        .mm-splash-tagline {
          margin-top: clamp(14px,2.5vh,24px);
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-size: clamp(0.68rem,1.8vw,0.86rem);
          color:rgba(255,255,255,0.60);
          letter-spacing:0.07em; text-align:center;
          animation: mmSplashFade 0.4s 0.28s ease both;
          max-width:320px;
        }
        .mm-splash-bar {
          margin-top: clamp(12px,2vh,20px);
          width: clamp(140px,35vw,240px);
          height:3px; border-radius:99px;
          background:rgba(255,255,255,0.18); overflow:hidden;
          animation: mmSplashFade 0.4s 0.36s ease both;
        }
        .mm-splash-bar-fill {
          height:100%; border-radius:99px;
          background: linear-gradient(90deg, rgba(255,255,255,0.55), #fff);
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          transition: width 0.06s linear;
        }
        .mm-splash-badge {
          position:absolute;
          bottom: max(14px, env(safe-area-inset-bottom, 14px));
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-size: clamp(0.58rem,1.2vw,0.70rem);
          color:rgba(255,255,255,0.36);
          letter-spacing:0.13em; text-transform:uppercase;
          animation: mmSplashFade 0.4s 0.5s ease both;
          text-align:center;
        }
        @keyframes mmSplashUp {
          from{opacity:0;transform:translateY(24px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes mmSplashFade {
          from{opacity:0} to{opacity:1}
        }
        @keyframes mmSplashFloat {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
      `}</style>

      <div className={`mm-splash${exiting ? " mm-exit" : ""}`}>
        <div className="mm-splash-light1" />
        <div className="mm-splash-light2" />

        {[
          { top:"9%",    left:"7%",    s:6,  o:0.17, d:"0s"   },
          { top:"17%",   right:"8%",   s:10, o:0.11, d:"0.3s" },
          { top:"48%",   left:"3.5%",  s:5,  o:0.15, d:"0.5s" },
          { top:"28%",   right:"3.5%", s:7,  o:0.12, d:"0.8s" },
          { bottom:"22%",left:"11%",   s:8,  o:0.14, d:"0.6s" },
          { bottom:"30%",right:"6%",   s:5,  o:0.18, d:"0.2s" },
        ].map((p, i) => (
          <div key={i} className="mm-splash-particle" style={{
            top:(p as {top?:string}).top,
            bottom:(p as {bottom?:string}).bottom,
            left:(p as {left?:string}).left,
            right:(p as {right?:string}).right,
            width:p.s, height:p.s, opacity:p.o,
            animationDelay:p.d,
          }} />
        ))}

        <div className="mm-splash-body">
          <div className="mm-splash-logo">
            <div className="mm-splash-main">MOKOLO</div>
            <div className="mm-splash-sub">Market</div>
          </div>

          <div className="mm-splash-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="rgba(255,255,255,0.22)" strokeWidth="5.5" />
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="#fff" strokeWidth="5.5" strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (progress / 100) * CIRC}
                style={{ transition:"stroke-dashoffset 0.06s linear",
                  filter:"drop-shadow(0 0 5px rgba(255,255,255,0.45))" }}
              />
            </svg>
            <div className="mm-splash-inner">
              <span className="mm-splash-pct">{progress}%</span>
            </div>
          </div>

          <p className="mm-splash-tagline">La marketplace africaine de confiance</p>

          <div className="mm-splash-bar">
            <div className="mm-splash-bar-fill" style={{ width:`${progress}%` }} />
          </div>
        </div>

        <div className="mm-splash-badge">ABJ Tech Agency · Yaoundé</div>
      </div>
    </>
  );
}

export default function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showApp, setShowApp]       = useState(false);

  const handleDone = () => {
    setShowSplash(false);
    // Court délai pour que la transition soit fluide
    setTimeout(() => setShowApp(true), 50);
  };

  return (
    <>
      {showSplash && <LoadingScreen onDone={handleDone} />}
      <div style={{
        opacity: showApp ? 1 : 0,
        transition: "opacity 0.4s ease",
        visibility: showApp ? "visible" : "hidden",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </>
  );
}
