"use client";

import { useRouter } from "next/navigation";
import { AuthSection } from "@/components/auth/AuthSection";

export default function AuthPage() {
  const router = useRouter();

  const handleAuthSuccess = (uid: string, isSeller: boolean) => {
    if (isSeller) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F9F9F9; font-family: var(--font-body,'Inter',sans-serif); }
        .mm-auth-wrap { min-height: 100vh; display: flex; align-items: stretch; }
        .mm-auth-left {
          display: none; flex: 1;
          background: linear-gradient(145deg, #0F0F0F 0%, #1a0205 60%, #2a0508 100%);
          padding: 48px; flex-direction: column;
          justify-content: center; position: relative; overflow: hidden;
        }
        @media(min-width: 900px) { .mm-auth-left { display: flex; } }
        .mm-auth-right {
          width: 100%; max-width: 480px; margin: 0 auto;
          padding: 32px 20px 48px; display: flex;
          flex-direction: column; justify-content: center; min-height: 100vh;
        }
        @keyframes mmFadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="mm-auth-wrap">
        {/* Panneau gauche desktop */}
        <div className="mm-auth-left">
          <div style={{ position:"absolute", top:"-20%", right:"-10%", width:"60%", height:"140%", background:"radial-gradient(ellipse, rgba(215,38,56,0.25) 0%, transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ fontFamily:"var(--font-heading,'Montserrat',sans-serif)", fontWeight:900, fontSize:"2.8rem", color:"#FFFFFF", lineHeight:1, marginBottom:8 }}>
              MOKOLO<br /><span style={{ color:"#D72638" }}>MARKET</span>
            </div>
            <p style={{ color:"rgba(255,255,255,0.50)", fontSize:"1rem", marginBottom:48, lineHeight:1.6 }}>
              La marketplace africaine de confiance
            </p>
            {[
              { icon:"🔒", title:"Paiement séquestré", desc:"Vos fonds sont sécurisés jusqu'à validation de la livraison" },
              { icon:"📱", title:"MTN & Orange Money", desc:"Paiements mobile money intégrés pour le Cameroun" },
              { icon:"🤝", title:"CRM IA intégré", desc:"Négociez directement avec les vendeurs via notre assistant IA" },
              { icon:"🚀", title:"Livraison 48h", desc:"Réseau de livreurs partenaires dans tout le Cameroun" },
            ].map((f, i) => (
              <div key={i} style={{ display:"flex", gap:14, marginBottom:24, animation:`mmFadeUp 0.5s ${i*0.1}s ease both` }}>
                <div style={{ width:42, height:42, borderRadius:12, background:"rgba(215,38,56,0.15)", border:"1px solid rgba(215,38,56,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>{f.icon}</div>
                <div>
                  <p style={{ color:"#FFFFFF", fontWeight:700, fontSize:"0.9rem", marginBottom:3 }}>{f.title}</p>
                  <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.8rem", lineHeight:1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ position:"relative", zIndex:1, color:"rgba(255,255,255,0.22)", fontSize:"0.7rem", marginTop:"auto" }}>
            © {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé
          </p>
        </div>

        {/* Panneau droit — formulaire */}
        <div className="mm-auth-right">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <a href="/" style={{ textDecoration:"none" }}>
              <div style={{ fontFamily:"var(--font-heading,'Montserrat',sans-serif)", fontWeight:900, fontSize:"1.7rem", color:"#0F0F0F" }}>
                MOKOLO <span style={{ color:"#D72638" }}>MARKET</span>
              </div>
            </a>
            <p style={{ fontSize:"0.78rem", color:"#666666", marginTop:5 }}>
              La marketplace africaine de confiance
            </p>
          </div>
          <AuthSection onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    </>
  );
}
