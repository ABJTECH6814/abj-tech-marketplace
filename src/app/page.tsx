import { useScrollReveal } from "@/hooks/useScrollReveal";
"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  collection, onSnapshot, query, where,
  orderBy, limit, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface PriceTier { minQty: number; price: number; label?: string; }
interface ProductVariant { color: string; colorHex: string; stock: number; }
interface Product {
  id: string; title: string; category: string;
  images: string[]; priceTiers: PriceTier[];
  variants?: ProductVariant[];
  shopSlug?: string; shopName?: string;
  status: string;
}
interface SellerProfile {
  id: string; shopName: string; shopSlug: string;
  logoUrl?: string; city?: string; rating?: number;
  badge?: string; subscriptionPlan?: string;
}
interface Banner {
  id: string; imageUrl: string; linkUrl: string;
  title: string; shopName: string;
}
interface Video {
  id: string; videoUrl?: string; thumbnailUrl?: string;
  title: string; shopName?: string; type: string; views?: number;
}

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const MM = {
  red:      "#D72638",
  redDark:  "#A51C2B",
  redLight: "#FFF0F2",
  black:    "#0F0F0F",
  blackSoft:"#1A1A1A",
  white:    "#FFFFFF",
  gray50:   "#F9F9F9",
  gray100:  "#F3F4F6",
  gray200:  "#E5E5E5",
  gray600:  "#666666",
  blue:     "#2563EB",
  green:    "#16a34a",
  greenLight:"#DCFCE7",
  orange:   "#F59E0B",
};

const CATEGORIES = [
  { label: "Téléphones & Électronique", icon: "📱" },
  { label: "Mode & Vêtements",          icon: "👕" },
  { label: "Maison & Décoration",       icon: "🏠" },
  { label: "Alimentation & Agro",       icon: "🌾" },
  { label: "Beauté & Santé",            icon: "💄" },
  { label: "Services B2B",              icon: "🏢" },
];

/* ─────────────────────────────────────────
   COMPOSANT ALERTE GLOBALE
───────────────────────────────────────── */
interface AlertProps {
  type: "success"|"error"|"info"|"warning";
  message: string;
  onClose: () => void;
}
function Alert({ type, message, onClose }: AlertProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    success: { bg: "#DCFCE7", border: "#86EFAC", color: "#15803d", icon: "✓" },
    error:   { bg: "#FEE2E2", border: "#FCA5A5", color: MM.redDark, icon: "✕" },
    info:    { bg: "#EFF6FF", border: "#93C5FD", color: MM.blue,    icon: "ℹ" },
    warning: { bg: "#FEF3C7", border: "#FDE68A", color: "#B45309",  icon: "⚠" },
  };
  const s = styles[type];

  return (
    <div style={{
      position: "fixed", top: 70, left: 12, right: 12, zIndex: 9000,
      background: s.bg, border: `1.5px solid ${s.border}`,
      borderRadius: 12, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      animation: "mmSlideDown 0.3s cubic-bezier(0.34,1.4,0.64,1) both",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: s.color, color: MM.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.85rem", fontWeight: 900, flexShrink: 0,
      }}>{s.icon}</div>
      <p style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: s.color, lineHeight: 1.4 }}>
        {message}
      </p>
      <button onClick={onClose} style={{ color: s.color, fontSize: "1.1rem", opacity: 0.6 }}>×</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   MODAL INSCRIPTION / AUTH
───────────────────────────────────────── */
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "register"|"login";
  reason?: string;
  onSuccess: (msg: string) => void;
}
function AuthModal({ open, onClose, mode = "register", reason, onSuccess }: AuthModalProps) {
  const [tab, setTab]         = useState<"login"|"register">(mode);
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "", type: "BUYER" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onClose();
    onSuccess(tab === "register"
      ? "Compte créé avec succès ! Bienvenue sur Mokolo Market 🎉"
      : "Connexion réussie ! Bon retour sur Mokolo Market 👋"
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "flex-end",
      backdropFilter: "blur(3px)",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", background: MM.white,
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          maxHeight: "90vh", overflowY: "auto",
          animation: "mmSlideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) both",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: MM.gray200, borderRadius: 99, margin: "0 auto 20px" }} />

        {/* Raison */}
        {reason && (
          <div style={{
            background: MM.redLight, border: `1px solid ${MM.red}30`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 18,
            fontSize: "0.8rem", color: MM.redDark, fontWeight: 600,
          }}>
            🔒 {reason}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", background: MM.gray100,
          borderRadius: 10, padding: 4, marginBottom: 20,
        }}>
          {(["register", "login"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "9px 0",
              background: tab === t ? MM.white : "transparent",
              border: "none", borderRadius: 8,
              fontSize: "0.82rem", fontWeight: 700,
              color: tab === t ? MM.black : MM.gray600,
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              transition: "all 0.2s",
            }}>
              {t === "register" ? "S'inscrire" : "Se connecter"}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "register" && (
            <>
              <FormField label="Nom complet" placeholder="Jean Mbarga" type="text"
                value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
              {/* Type compte */}
              <div>
                <label style={fieldLabelStyle}>Type de compte</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {["BUYER", "SELLER"].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                      flex: 1, padding: "10px",
                      border: `1.5px solid ${form.type === t ? MM.red : MM.gray200}`,
                      borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
                      background: form.type === t ? MM.redLight : MM.white,
                      color: form.type === t ? MM.red : MM.gray600,
                      transition: "all 0.18s",
                    }}>
                      {t === "BUYER" ? "🛒 Acheteur" : "🏪 Vendeur"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <FormField label="Email" placeholder="jean@email.cm" type="email"
            value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          {tab === "register" && (
            <FormField label="Téléphone" placeholder="+237 6XX XXX XXX" type="tel"
              value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          )}
          <FormField label="Mot de passe" placeholder="••••••••" type="password"
            value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />

          {/* CGV */}
          {tab === "register" && (
            <p style={{ fontSize: "0.72rem", color: MM.gray600, lineHeight: 1.5 }}>
              En vous inscrivant, vous acceptez nos{" "}
              <Link href="/cgu" style={{ color: MM.red, fontWeight: 600 }}>CGU</Link>{" "}
              et notre{" "}
              <Link href="/confidentialite" style={{ color: MM.red, fontWeight: 600 }}>Politique de confidentialité</Link>.
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            background: loading ? MM.gray200 : MM.red,
            color: MM.white, border: "none",
            borderRadius: 12, padding: "14px",
            fontSize: "0.9rem", fontWeight: 700,
            boxShadow: loading ? "none" : "0 4px 16px rgba(215,38,56,0.35)",
            transition: "all 0.2s", marginTop: 4,
          }}>
            {loading ? "⏳ Traitement…" : tab === "register" ? "Créer mon compte" : "Se connecter"}
          </button>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: MM.gray200 }} />
            <span style={{ fontSize: "0.72rem", color: MM.gray600 }}>ou continuer avec</span>
            <div style={{ flex: 1, height: 1, background: MM.gray200 }} />
          </div>

          <button style={{
            border: `1.5px solid ${MM.gray200}`, borderRadius: 12,
            padding: "12px", background: MM.white,
            fontSize: "0.85rem", fontWeight: 600, color: MM.black,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: "1.1rem" }}>G</span> Google
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, type, value, onChange }: {
  label: string; placeholder: string; type: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{
          width: "100%", padding: "11px 14px",
          border: `1.5px solid ${MM.gray200}`, borderRadius: 10,
          fontSize: "0.875rem", color: MM.black, outline: "none",
          background: MM.gray50, marginTop: 5,
          boxSizing: "border-box" as const,
        }} />
    </div>
  );
}
const fieldLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem", fontWeight: 700, color: MM.gray600,
  textTransform: "uppercase", letterSpacing: "0.05em",
};

/* ─────────────────────────────────────────
   MODAL CHAT / NÉGOCIATION
───────────────────────────────────────── */
interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  priceType: "normal"|"negotiated"|"wholesale";
  isAuth: boolean;
  onAuthRequired: (reason: string) => void;
}
function ChatModal({ open, onClose, product, priceType, isAuth, onAuthRequired }: ChatModalProps) {
  const [messages, setMessages] = useState<{ role: "user"|"ai"; text: string }[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && product) {
      const price = product.priceTiers?.[priceType === "normal" ? 0 : priceType === "negotiated" ? 1 : 2]?.price;
      setMessages([{
        role: "ai",
        text: priceType === "negotiated"
          ? `Bonjour ! Je suis l'assistant IA de ${product.shopName ?? "cette boutique"}. Le prix affiché pour "${product.title}" est de ${price?.toLocaleString()} FCFA. Quelle quantité vous intéresse ? Je peux vous proposer une offre personnalisée. 🤝`
          : `Bonjour ! Je suis l'assistant de ${product.shopName ?? "cette boutique"}. Pour une commande en gros de "${product.title}" (${price?.toLocaleString()} FCFA / unité dès ${product.priceTiers?.[2]?.minQty} unités), comment puis-je vous aider ? 📦`,
      }]);
    }
  }, [open, product, priceType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open || !product) return null;

  const send = async () => {
    if (!isAuth) {
      onClose();
      onAuthRequired("Connectez-vous pour négocier avec le vendeur.");
      return;
    }
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));

    // Réponse IA simulée — en production : appel API Claude
    const aiReply = userMsg.toLowerCase().includes("prix") || userMsg.toLowerCase().includes("combien")
      ? `Je comprends votre intérêt ! Pour une commande de cette quantité, je peux vous proposer ${(product.priceTiers?.[1]?.price ?? 0).toLocaleString()} FCFA l'unité. C'est notre meilleur prix négocié. Êtes-vous intéressé(e) ?`
      : userMsg.toLowerCase().includes("quantit") || userMsg.toLowerCase().includes("unité")
      ? `Parfait ! Pour cette quantité, le prix de gros s'applique : ${(product.priceTiers?.[2]?.price ?? 0).toLocaleString()} FCFA/unité. Je peux préparer un devis détaillé si vous le souhaitez.`
      : `Merci pour votre message. Notre équipe vous recontactera sous 24h pour finaliser les détails. Avez-vous d'autres questions sur "${product.title}" ?`;

    setMessages(m => [...m, { role: "ai", text: aiReply }]);
    setSending(false);
  };

  const priceColors = { normal: MM.red, negotiated: MM.black, wholesale: MM.green };
  const priceLabels = { normal: "Prix normal", negotiated: "Négociation", wholesale: "Prix de gros" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "flex-end",
      backdropFilter: "blur(3px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", background: MM.white,
        borderRadius: "20px 20px 0 0",
        maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        animation: "mmSlideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        {/* Header chat */}
        <div style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${MM.gray200}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: MM.gray100, overflow: "hidden", flexShrink: 0 }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.title}
            </p>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700,
              color: priceColors[priceType],
              background: priceType === "negotiated" ? MM.gray100 : priceType === "wholesale" ? MM.greenLight : MM.redLight,
              padding: "2px 7px", borderRadius: 4,
            }}>
              {priceLabels[priceType]}
            </span>
          </div>
          <button onClick={onClose} style={{ fontSize: "1.3rem", color: MM.gray600 }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              {m.role === "ai" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: MM.red, color: MM.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 900, marginRight: 8, flexShrink: 0,
                }}>IA</div>
              )}
              <div style={{
                maxWidth: "78%",
                background: m.role === "user" ? MM.red : MM.gray100,
                color: m.role === "user" ? MM.white : MM.black,
                padding: "10px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                fontSize: "0.82rem", lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: MM.gray600,
                  animation: `mmPulse 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 24px",
          borderTop: `1px solid ${MM.gray200}`,
          display: "flex", gap: 10,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Votre message…"
            style={{
              flex: 1, padding: "11px 14px",
              border: `1.5px solid ${MM.gray200}`, borderRadius: 12,
              fontSize: "0.85rem", outline: "none", background: MM.gray50,
            }}
          />
          <button onClick={send} style={{
            background: MM.red, color: MM.white,
            border: "none", borderRadius: 12,
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
            boxShadow: "0 2px 10px rgba(215,38,56,0.3)",
          }}>→</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────── */
export default function HomePage() {
  const { user, userData } = useAuth();
  const [products, setProducts]         = useState<Product[]>([]);
  const [sellers, setSellers]           = useState<SellerProfile[]>([]);
  const [sponsored, setSponsored]       = useState<SellerProfile[]>([]);
  const [banners, setBanners]           = useState<Banner[]>([]);
  const [videos, setVideos]             = useState<Video[]>([]);
  const [sellerCount, setSellerCount]   = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<"home"|"reels"|"market"|"messages"|"profile">("home");
  const [lang, setLang]                 = useState<"fr"|"en">("fr");

  // Auth modal
  const [authModal, setAuthModal]     = useState(false);
  const [authReason, setAuthReason]   = useState("");
  const [authMode, setAuthMode]       = useState<"register"|"login">("register");

  // Chat modal
  const [chatModal, setChatModal]     = useState(false);
  const [chatProduct, setChatProduct] = useState<Product | null>(null);
  const [chatPriceType, setChatPriceType] = useState<"normal"|"negotiated"|"wholesale">("negotiated");

  // Alert
  const [alert, setAlert]             = useState<{ type: "success"|"error"|"info"|"warning"; message: string } | null>(null);

  const showAlert = useCallback((type: "success"|"error"|"info"|"warning", message: string) => {
    setAlert({ type, message });
  }, []);

  const requireAuth = useCallback((reason: string, mode: "register"|"login" = "register") => {
    setAuthReason(reason);
    setAuthMode(mode);
    setAuthModal(true);
  }, []);

  const openChat = useCallback((product: Product, priceType: "normal"|"negotiated"|"wholesale") => {
    if (!user) {
      requireAuth("Connectez-vous pour négocier directement avec le vendeur.");
      return;
    }
    setChatProduct(product);
    setChatPriceType(priceType);
    setChatModal(true);
  }, [user, requireAuth]);

  /* Firestore listeners */
  useEffect(() => {
    const q = query(collection(db,"products"), where("status","==","ACTIVE"), orderBy("createdAt","desc"), limit(40));
    const u = onSnapshot(q, s => { setProducts(s.docs.map(d=>({id:d.id,...d.data()} as Product))); setLoading(false); }, ()=>setLoading(false));
    return ()=>u();
  },[]);

  useEffect(() => {
    const q = query(collection(db,"sellerProfiles"), orderBy("totalSales","desc"), limit(10));
    const u = onSnapshot(q, s => setSellers(s.docs.map(d=>({id:d.id,...d.data()} as SellerProfile))));
    return ()=>u();
  },[]);

  useEffect(() => {
    const q = query(collection(db,"sellerProfiles"), where("subscriptionPlan","!=","FREE"), limit(6));
    const u = onSnapshot(q, s => setSponsored(s.docs.map(d=>({id:d.id,...d.data()} as SellerProfile))));
    return ()=>u();
  },[]);

  useEffect(() => {
    const q = query(collection(db,"banners"), where("active","==",true), orderBy("priority","asc"), limit(8));
    const u = onSnapshot(q, s => setBanners(s.docs.map(d=>({id:d.id,...d.data()} as Banner))));
    return ()=>u();
  },[]);

  useEffect(() => {
    const q = query(collection(db,"videos"), where("active","==",true), orderBy("createdAt","desc"), limit(10));
    const u = onSnapshot(q, s => setVideos(s.docs.map(d=>({id:d.id,...d.data()} as Video))));
    return ()=>u();
  },[]);

  useEffect(() => {
    (async()=>{
      try {
        const [s,p] = await Promise.all([
          getCountFromServer(collection(db,"sellerProfiles")),
          getCountFromServer(query(collection(db,"products"),where("status","==","ACTIVE"))),
        ]);
        setSellerCount(s.data().count);
        setProductCount(p.data().count);
      } catch{}
    })();
  },[]);

  const filtered = products.filter(p => {
    const matchCat    = !activeCategory || p.category === activeCategory;
    const matchSearch = !search
      || p.title.toLowerCase().includes(search.toLowerCase())
      || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isEmpty = !loading && products.length === 0 && sellers.length === 0;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; background: #F9F9F9; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        img { display: block; }

        .mm-page { padding-bottom: 70px; min-height: 100vh; overflow-x: hidden; }

        /* Scroll horizontal */
        .mm-hscroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
        .mm-hscroll::-webkit-scrollbar { display: none; }
        .mm-hscroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* Grille produits 2 colonnes */
        .mm-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        @media(min-width:900px){ .mm-grid { grid-template-columns: repeat(4,1fr); gap: 14px; } }

        /* Hover carte */
        .mm-pcard { transition: box-shadow 0.2s, transform 0.2s; }
        .mm-pcard:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }

        /* Bottom nav */
        .mm-bnav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 500;
          background: #fff; border-top: 1px solid #E5E5E5;
          display: flex; height: 62px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        }
        .mm-nitem {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          position: relative; padding: 6px 0;
          transition: color 0.15s;
        }
        .mm-nicon { font-size: 1.25rem; line-height: 1; }
        .mm-nlabel { font-size: 0.58rem; font-weight: 600; letter-spacing: 0.02em; }
        .mm-nbar {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 22px; height: 3px; border-radius: 99px; background: #D72638;
        }

        /* Cats scroll */
        .mm-cats { display: flex; gap: 8px; overflow-x: auto; }
        .mm-cats::-webkit-scrollbar { display: none; }
        .mm-cats { -ms-overflow-style: none; scrollbar-width: none; }

        /* Animations */
        @keyframes mmSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes mmPulse { 0%,100%{opacity:.4} 50%{opacity:.85} }
        @keyframes mmSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes mmSlideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes mmFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* Scroll infini produits */
        .mm-infinite-track {
          display: flex; gap: 12px;
          animation: mmSlide 40s linear infinite;
          width: max-content;
        }
      `}</style>

      {/* Alerte globale */}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Modal Auth */}
      <AuthModal
        open={authModal} mode={authMode} reason={authReason}
        onClose={() => setAuthModal(false)}
        onSuccess={msg => showAlert("success", msg)}
      />

      {/* Modal Chat */}
      <ChatModal
        open={chatModal} product={chatProduct} priceType={chatPriceType}
        isAuth={!!user}
        onClose={() => setChatModal(false)}
        onAuthRequired={reason => { setChatModal(false); requireAuth(reason); }}
      />

      <div className="mm-page">

        {/* ══ HEADER ══ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: MM.white, borderBottom: `1px solid ${MM.gray200}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 6px" }}>
            <div>
              <div style={{
                fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
                fontWeight: 900, fontSize: "1.15rem", lineHeight: 1,
              }}>
                MOKOLO <span style={{ color: MM.red }}>MARKET</span>
              </div>
              <div style={{ fontSize: "0.62rem", color: MM.gray600, marginTop: 1 }}>
                {lang === "fr" ? "Votre marketplace africaine" : "Your African marketplace"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} style={{
                background: MM.gray100, borderRadius: 6,
                padding: "4px 8px", fontSize: "0.68rem", fontWeight: 700, color: MM.black,
              }}>{lang.toUpperCase()}</button>
              <button style={{ padding: 6, position: "relative" }}>
                <span style={{ fontSize: "1.2rem" }}>🔔</span>
              </button>
              <button onClick={() => !user && requireAuth("Connectez-vous pour accéder à vos messages.")}
                style={{ padding: 6 }}>
                <span style={{ fontSize: "1.2rem" }}>💬</span>
              </button>
              <button onClick={() => !user && requireAuth("Connectez-vous pour accéder à votre panier.")}
                style={{ padding: 6 }}>
                <span style={{ fontSize: "1.2rem" }}>🛒</span>
              </button>
              {!user && (
                <button onClick={() => requireAuth("Créez votre compte pour profiter de toutes les fonctionnalités.")} style={{
                  background: MM.red, color: MM.white,
                  padding: "6px 12px", borderRadius: 8,
                  fontSize: "0.72rem", fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(215,38,56,0.3)",
                }}>
                  {lang === "fr" ? "S'inscrire" : "Sign up"}
                </button>
              )}
            </div>
          </div>

          {/* Recherche */}
          <div style={{ padding: "0 16px 10px" }}>
            <div style={{
              display: "flex", alignItems: "center",
              background: MM.gray100, borderRadius: 12,
              padding: "0 14px", height: 40,
              border: `1px solid ${MM.gray200}`,
            }}>
              <span style={{ fontSize: "0.9rem", marginRight: 8, opacity: 0.5 }}>🔍</span>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher un produit, vendeur…" : "Search product, seller…"}
                style={{
                  flex: 1, background: "none", border: "none",
                  fontSize: "0.82rem", color: MM.black, outline: "none",
                }}
              />
              {search
                ? <button onClick={() => setSearch("")} style={{ fontSize: "1rem", color: MM.gray600 }}>×</button>
                : <div style={{ width: 1, height: 18, background: MM.gray200, margin: "0 8px" }} />
              }
              <button style={{ fontSize: "0.85rem" }}>⚙️</button>
            </div>
          </div>
        </header>

        {/* ══ PAGE VIDE — Invitation ══ */}
        {isEmpty && (
          <div style={{ padding: "56px 20px", textAlign: "center", animation: "mmFadeUp 0.5s ease both" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🛍️</div>
            <h2 style={{
              fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
              fontSize: "1.25rem", fontWeight: 900, color: MM.black, marginBottom: 10,
            }}>
              {lang === "fr" ? "Bienvenue sur Mokolo Market" : "Welcome to Mokolo Market"}
            </h2>
            <p style={{ color: MM.gray600, fontSize: "0.85rem", lineHeight: 1.6, maxWidth: 300, margin: "0 auto 28px" }}>
              {lang === "fr"
                ? "La marketplace africaine de confiance. Inscrivez-vous pour publier vos produits."
                : "Africa's trusted marketplace. Sign up to publish your products."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
              <button onClick={() => requireAuth("Créez votre compte vendeur pour publier vos premiers produits.")} style={{
                background: MM.red, color: MM.white,
                padding: "14px 24px", borderRadius: 12,
                fontWeight: 700, fontSize: "0.9rem",
                boxShadow: "0 4px 16px rgba(215,38,56,0.35)",
              }}>
                {lang === "fr" ? "S'inscrire maintenant" : "Register now"}
              </button>
              <button onClick={() => requireAuth("Connectez-vous à votre compte.", "login")} style={{
                background: MM.white, color: MM.black,
                border: `1.5px solid ${MM.gray200}`,
                padding: "13px 24px", borderRadius: 12,
                fontWeight: 600, fontSize: "0.9rem",
              }}>
                {lang === "fr" ? "Se connecter" : "Sign in"}
              </button>
            </div>
          </div>
        )}

        {/* ══ CONTENU PRINCIPAL ══ */}
        {!isEmpty && (
          <>
            {/* Catégories */}
            <div style={{ padding: "12px 16px 10px", background: MM.white, borderBottom: `1px solid ${MM.gray200}` }}>
              <div className="mm-cats">
                {CATEGORIES.map(c => {
                  const isActive = activeCategory === c.label;
                  return (
                    <button key={c.label} onClick={() => setActiveCategory(isActive ? null : c.label)} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 13px", borderRadius: 20, flexShrink: 0,
                      fontSize: "0.75rem", fontWeight: 600,
                      border: `1.5px solid ${isActive ? MM.red : MM.gray200}`,
                      background: isActive ? MM.red : MM.white,
                      color: isActive ? MM.white : MM.black,
                      boxShadow: isActive ? "0 3px 10px rgba(215,38,56,0.22)" : "none",
                      transition: "all 0.18s",
                    }}>
                      <span>{c.icon}</span><span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── BOUTIQUES SPONSORISÉES ── */}
            {sponsored.length > 0 && (
              <section style={{ padding: "16px 16px 12px", background: MM.white, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: MM.black, borderRadius: 8, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.75rem" }}>⭐</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "0.95rem", fontWeight: 900 }}>
                      {lang === "fr" ? "Boutiques Sponsorisées" : "Sponsored Shops"}
                    </span>
                  </div>
                  <Link href="/boutiques" style={{ fontSize: "0.72rem", fontWeight: 600, color: MM.red }}>
                    {lang === "fr" ? "Voir tout →" : "See all →"}
                  </Link>
                </div>
                <div className="mm-hscroll">
                  {sponsored.map(s => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} style={{
                      flexShrink: 0, width: 270,
                      background: MM.white, border: `1px solid ${MM.gray200}`,
                      borderRadius: 14, overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}>
                      <div style={{ height: 80, background: `linear-gradient(135deg, ${MM.black}, ${MM.redDark})`, position: "relative" }}>
                        <span style={{ position: "absolute", top: 7, left: 8, background: MM.red, color: MM.white, fontSize: "0.58rem", fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>→ Sponsorisé</span>
                        <span style={{ position: "absolute", top: 7, right: 8, background: "rgba(245,158,11,0.15)", color: MM.orange, border: `1px solid ${MM.orange}44`, fontSize: "0.58rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>★ Recommandée</span>
                      </div>
                      <div style={{ padding: "8px 12px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: s.logoUrl ? "transparent" : MM.red, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -22, border: `2px solid ${MM.white}`, boxShadow: "0 2px 6px rgba(0,0,0,0.12)", position: "relative", zIndex: 1 }}>
                            {s.logoUrl
                              ? <img src={s.logoUrl} alt={s.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <span style={{ color: MM.white, fontWeight: 900 }}>{s.shopName.charAt(0)}</span>
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{s.shopName}</div>
                            {s.city && <div style={{ fontSize: "0.65rem", color: MM.gray600 }}>📍 {s.city}</div>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                          <span style={{ fontSize: "0.7rem", color: MM.gray600, maxWidth: 150 }}>Mokolo vous encourage à acheter</span>
                          <span style={{ background: MM.redLight, color: MM.red, fontSize: "0.7rem", fontWeight: 700, padding: "5px 10px", borderRadius: 20 }}>Acheter</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── BANNIÈRES SCROLL HORIZONTAL ── */}
            {banners.length > 0 && (
              <section style={{ padding: "14px 0 10px 16px", marginTop: 8 }}>
                <div className="mm-hscroll">
                  {banners.map(b => (
                    <a key={b.id} href={b.linkUrl} target="_blank" rel="noopener noreferrer" style={{
                      flexShrink: 0, width: "clamp(240px,70vw,320px)",
                      height: 110, borderRadius: 14, overflow: "hidden",
                      position: "relative", display: "block",
                      background: `linear-gradient(135deg, ${MM.black}, ${MM.redDark})`,
                    }}>
                      {b.imageUrl && <img src={b.imageUrl} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      {!b.imageUrl && (
                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: MM.white, fontWeight: 700, fontSize: "0.85rem" }}>{b.title}</span>
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: 4 }}>{b.shopName}</span>
                        </div>
                      )}
                      <span style={{ position: "absolute", top: 7, left: 9, background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.75)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4 }}>Sponsorisé</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ── CARROUSEL INFINI ── */}
            {products.length > 0 && (
              <section style={{ padding: "16px 0 0 0", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "0.95rem", fontWeight: 900 }}>
                    🔥 {lang === "fr" ? "Arrivages récents" : "Recent arrivals"}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: MM.gray600 }}>↔ En continu</span>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div className="mm-infinite-track">
                    {[...products, ...products].map((p, i) => (
                      <div key={`${p.id}-${i}`} style={{ width: 150, flexShrink: 0, background: MM.white, border: `1px solid ${MM.gray200}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ width: "100%", aspectRatio: "1/1", background: MM.gray100, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: "1.8rem" }}>📦</span>
                          }
                        </div>
                        <div style={{ padding: "7px 9px" }}>
                          <p style={{ fontSize: "0.6rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{p.category}</p>
                          <p style={{ fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                          {p.priceTiers?.[0] && (
                            <p style={{ fontSize: "0.78rem", fontWeight: 800, color: MM.red, marginTop: 4 }}>
                              {p.priceTiers[0].price.toLocaleString()} <span style={{ fontSize: "0.6rem" }}>F</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── REELS SCROLL HORIZONTAL ── */}
            {videos.length > 0 && (
              <section style={{ padding: "16px 0 0 16px", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 16, marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "0.95rem", fontWeight: 900 }}>
                    🎬 {lang === "fr" ? "Reels & Vidéos" : "Reels & Videos"}
                  </span>
                  <Link href="/reels" style={{ fontSize: "0.72rem", fontWeight: 600, color: MM.red }}>
                    {lang === "fr" ? "Voir tout →" : "See all →"}
                  </Link>
                </div>
                <div className="mm-hscroll">
                  {videos.map(v => (
                    <Link key={v.id} href={`/reels/${v.id}`} style={{
                      flexShrink: 0, width: 120,
                      aspectRatio: "9/16", borderRadius: 12,
                      overflow: "hidden", position: "relative",
                      background: MM.black, display: "block",
                    }}>
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "2rem" }}>🎬</span>
                          </div>
                      }
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.8rem", marginLeft: 2 }}>▶</span>
                      </div>
                      {v.type === "REEL" && (
                        <span style={{ position: "absolute", top: 7, left: 7, background: MM.red, color: MM.white, fontSize: "0.5rem", fontWeight: 800, padding: "2px 5px", borderRadius: 4 }}>REEL</span>
                      )}
                      <div style={{ position: "absolute", bottom: 7, left: 7, right: 7 }}>
                        <p style={{ fontSize: "0.62rem", fontWeight: 600, color: MM.white, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{v.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── CATALOGUE ── */}
            <section style={{ padding: "18px 16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "0.95rem", fontWeight: 900 }}>
                  {activeCategory ?? (lang === "fr" ? "Tous les produits" : "All products")}
                </span>
                {activeCategory && (
                  <button onClick={() => setActiveCategory(null)} style={{
                    background: MM.redLight, color: MM.red,
                    border: `1px solid ${MM.red}30`, borderRadius: 7,
                    padding: "4px 9px", fontSize: "0.72rem", fontWeight: 600,
                  }}>Voir tout ×</button>
                )}
              </div>

              {loading ? <SkeletonGrid /> : filtered.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <span style={{ fontSize: "2.5rem" }}>🛍️</span>
                  <p style={{ marginTop: 10, color: MM.gray600, fontSize: "0.85rem" }}>
                    {search ? `Aucun résultat pour "${search}"` : "Aucun produit dans cette catégorie"}
                  </p>
                </div>
              ) : (
                <div className="mm-grid">
                  {filtered.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onChat={openChat}
                      onAuthRequired={requireAuth}
                      isAuth={!!user}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── BOUTIQUES POPULAIRES ── */}
            {sellers.length > 0 && (
              <section style={{ padding: "20px 16px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "0.95rem", fontWeight: 900 }}>
                      🏪 {lang === "fr" ? "Boutiques Populaires" : "Popular Shops"}
                    </span>
                    <span style={{ background: MM.red, color: MM.white, fontSize: "0.58rem", fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>● Statuts</span>
                  </div>
                  <Link href="/boutiques" style={{ fontSize: "0.72rem", fontWeight: 600, color: MM.red }}>
                    {lang === "fr" ? "Voir + →" : "See more →"}
                  </Link>
                </div>
                <div className="mm-grid">
                  {sellers.slice(0,6).map(s => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} style={{
                      background: MM.white, border: `1px solid ${MM.gray200}`,
                      borderRadius: 12, padding: "14px 10px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", textAlign: "center", gap: 6,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}>
                      <div style={{ width: 50, height: 50, borderRadius: 13, background: s.logoUrl ? "transparent" : MM.red, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }}>
                        {s.logoUrl
                          ? <img src={s.logoUrl} alt={s.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ color: MM.white, fontWeight: 900, fontSize: "1.2rem" }}>{s.shopName.charAt(0)}</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.78rem" }}>{s.shopName}</div>
                        {s.city && <div style={{ fontSize: "0.62rem", color: MM.gray600, marginTop: 2 }}>📍 {s.city}</div>}
                        <div style={{ fontSize: "0.62rem", color: MM.orange, marginTop: 3 }}>★ {s.rating?.toFixed(1) ?? "0.0"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── CTA VENDEUR ── */}
            <section style={{ margin: "20px 16px 0", background: `linear-gradient(135deg, ${MM.black} 0%, #1a0205 100%)`, borderRadius: 16, padding: "24px 20px", border: `1px solid ${MM.red}30` }}>
              <h2 style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontSize: "clamp(1rem,4vw,1.3rem)", fontWeight: 900, color: MM.white, marginBottom: 8 }}>
                {lang === "fr" ? "Commencer à vendre" : "Start selling"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", marginBottom: 18, lineHeight: 1.6 }}>
                {lang === "fr"
                  ? "Rejoignez des milliers de vendeurs. Paiement sécurisé, commission transparente."
                  : "Join thousands of sellers. Secure payment, transparent commission."}
              </p>
              <button onClick={() => requireAuth("Créez votre compte vendeur pour ouvrir votre boutique sur Mokolo Market.")} style={{
                background: MM.red, color: MM.white,
                border: "none", borderRadius: 10,
                padding: "11px 24px", fontSize: "0.875rem", fontWeight: 700,
                boxShadow: "0 4px 16px rgba(215,38,56,0.4)",
              }}>
                {lang === "fr" ? "Ouvrir ma boutique →" : "Open my shop →"}
              </button>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ padding: "24px 16px 16px", marginTop: 20 }}>
              <p style={{ fontFamily: "var(--font-heading,'Montserrat',sans-serif)", fontWeight: 900, fontSize: "1rem", color: MM.black, marginBottom: 4 }}>
                MOKOLO <span style={{ color: MM.red }}>MARKET</span>
              </p>
              <p style={{ color: MM.gray600, fontSize: "0.7rem", marginBottom: 14 }}>
                {lang === "fr" ? "La marketplace africaine de confiance" : "Africa's trusted marketplace"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 14 }}>
                {[
                  { href: "/auth",             label: lang === "fr" ? "Connexion" : "Sign in" },
                  { href: "/auth?mode=seller", label: lang === "fr" ? "Devenir vendeur" : "Become seller" },
                  { href: "/aide",             label: lang === "fr" ? "Aide" : "Help" },
                  { href: "/contact",          label: "Contact" },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ color: MM.gray600, fontSize: "0.75rem", fontWeight: 500 }}>{l.label}</Link>
                ))}
              </div>
              <p style={{ color: MM.gray200, fontSize: "0.65rem" }}>
                © {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé
              </p>
            </footer>
          </>
        )}
      </div>

      {/* ══ BOTTOM NAV ══ */}
      <nav className="mm-bnav">
        {([
          { key: "home",     icon: "🏠", fr: "Accueil",  en: "Home"     },
          { key: "reels",    icon: "🎬", fr: "Reels",    en: "Reels"    },
          { key: "market",   icon: "🏪", fr: "Market",   en: "Market"   },
          { key: "messages", icon: "💬", fr: "Messages", en: "Messages" },
          { key: "profile",  icon: "👤", fr: "Profil",   en: "Profile"  },
        ] as { key: typeof activeTab; icon: string; fr: string; en: string }[]).map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => {
              setActiveTab(tab.key);
              if ((tab.key === "messages" || tab.key === "profile") && !user) {
                requireAuth(
                  tab.key === "messages"
                    ? "Connectez-vous pour accéder à vos messages."
                    : "Connectez-vous pour accéder à votre profil."
                );
              }
            }} className="mm-nitem" style={{ color: isActive ? MM.red : MM.gray600 }}>
              <span className="mm-nicon">{tab.icon}</span>
              <span className="mm-nlabel" style={{ fontWeight: isActive ? 700 : 500 }}>
                {lang === "fr" ? tab.fr : tab.en}
              </span>
              {isActive && <div className="mm-nbar" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────
   CARTE PRODUIT — DESIGN FINAL DÉFINITIF
───────────────────────────────────────── */
function ProductCard({ product, onChat, onAuthRequired, isAuth }: {
  product: Product;
  onChat: (p: Product, type: "normal"|"negotiated"|"wholesale") => void;
  onAuthRequired: (reason: string) => void;
  isAuth: boolean;
}) {
  const [imgIdx, setImgIdx] = useState(0);

  const prices = {
    normal:     product.priceTiers?.[0],
    negotiated: product.priceTiers?.[1],
    wholesale:  product.priceTiers?.[2],
  };

  const variants = product.variants ?? [];

  return (
    <div className="mm-pcard" style={{
      background: MM.white, border: `1px solid ${MM.gray200}`,
      borderRadius: 14, overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Image avec navigation si plusieurs */}
      <div style={{ width: "100%", aspectRatio: "1/1", background: MM.gray100, position: "relative", overflow: "hidden" }}>
        {product.images?.length > 0
          ? <img
              src={product.images[imgIdx] ?? product.images[0]}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2.5rem" }}>📦</span>
            </div>
        }
        {/* Points navigation images */}
        {product.images?.length > 1 && (
          <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {product.images.slice(0,4).map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{
                width: i === imgIdx ? 14 : 6, height: 6, borderRadius: 99,
                background: i === imgIdx ? MM.white : "rgba(255,255,255,0.55)",
                transition: "all 0.2s", border: "none",
              }} />
            ))}
          </div>
        )}
        {/* Badge B2B */}
        {prices.wholesale && (
          <span style={{ position: "absolute", top: 7, right: 7, background: MM.blue, color: MM.white, fontSize: "0.55rem", fontWeight: 800, padding: "2px 5px", borderRadius: 4 }}>B2B</span>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: "9px 10px", flex: 1 }}>
        <p style={{ fontSize: "0.6rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{product.category}</p>
        <h3 style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {product.title}
        </h3>

        {/* Variantes couleurs */}
        {variants.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {variants.slice(0, 5).map((v, i) => (
              <div key={i} title={v.color} style={{
                width: 14, height: 14, borderRadius: "50%",
                background: v.colorHex,
                border: `1.5px solid ${MM.gray200}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }} />
            ))}
            {variants.length > 5 && (
              <span style={{ fontSize: "0.6rem", color: MM.gray600 }}>+{variants.length - 5}</span>
            )}
          </div>
        )}

        {product.shopName && (
          <p style={{ fontSize: "0.62rem", color: MM.gray600, marginBottom: 6 }}>🏪 {product.shopName}</p>
        )}
      </div>

      {/* ── BOUTONS PRIX — DESIGN FINAL ── */}
      <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>

        {/* Prix normal → rouge → fiche produit */}
        {prices.normal && (
          <Link href={`/produits/${product.id}`} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: MM.red, color: MM.white,
            padding: "7px 10px", borderRadius: 8,
            fontSize: "0.72rem", fontWeight: 700,
            boxShadow: "0 2px 8px rgba(215,38,56,0.25)",
          }}>
            <span>Prix normal</span>
            <span>{prices.normal.price.toLocaleString()} F</span>
          </Link>
        )}

        {/* Prix négocié → noir → chat IA */}
        {prices.negotiated && (
          <button onClick={() => onChat(product, "negotiated")} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: MM.black, color: MM.white,
            padding: "7px 10px", borderRadius: 8,
            fontSize: "0.72rem", fontWeight: 700,
            border: "none",
          }}>
            <span>💬 Négocier</span>
            <span>{prices.negotiated.price.toLocaleString()} F</span>
          </button>
        )}

        {/* Prix de gros → vert → commande en gros */}
        {prices.wholesale && (
          <button onClick={() => {
            if (!isAuth) { onAuthRequired("Connectez-vous pour passer une commande en gros."); return; }
            onChat(product, "wholesale");
          }} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: MM.green, color: MM.white,
            padding: "7px 10px", borderRadius: 8,
            fontSize: "0.72rem", fontWeight: 700,
            border: "none",
          }}>
            <span>📦 Gros ({prices.wholesale.minQty}+ u)</span>
            <span>{prices.wholesale.price.toLocaleString()} F</span>
          </button>
        )}

        {/* Si aucun prix défini */}
        {!prices.normal && !prices.negotiated && !prices.wholesale && (
          <Link href={`/produits/${product.id}`} style={{
            display: "block", textAlign: "center",
            background: MM.redLight, color: MM.red,
            border: `1.5px solid ${MM.red}`, padding: "7px",
            borderRadius: 8, fontSize: "0.72rem", fontWeight: 700,
          }}>
            Voir le produit
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="mm-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: MM.white, borderRadius: 14, border: `1px solid ${MM.gray200}`, overflow: "hidden" }}>
          <div style={{ width: "100%", aspectRatio: "1/1", background: MM.gray100, animation: "mmPulse 1.5s ease-in-out infinite" }} />
          <div style={{ padding: 10 }}>
            <div style={{ height: 9, width: "55%", background: MM.gray100, borderRadius: 4, marginBottom: 7, animation: "mmPulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 13, width: "90%", background: MM.gray100, borderRadius: 4, marginBottom: 7, animation: "mmPulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 28, background: MM.gray100, borderRadius: 8, marginBottom: 5, animation: "mmPulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 28, background: MM.gray100, borderRadius: 8, animation: "mmPulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
