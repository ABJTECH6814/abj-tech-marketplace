"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
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
interface PriceTier { minQty: number; price: number; }
interface Product {
  id: string; title: string; category: string;
  images: string[]; priceTiers: PriceTier[];
  shopSlug?: string; shopName?: string;
}
interface SellerProfile {
  id: string; shopName: string; shopSlug: string;
  logoUrl?: string; city?: string; rating?: number;
  type?: string; badge?: string; subscriptionPlan?: string;
}
interface Banner {
  id: string; imageUrl: string; linkUrl: string;
  title: string; shopName: string;
}
interface Video {
  id: string; videoUrl: string; thumbnailUrl?: string;
  title: string; shopName?: string; type: string; views?: number;
}
interface Notification {
  id: string; message: string; read: boolean; type: string;
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
   PAGE PRINCIPALE
───────────────────────────────────────── */
export default function HomePage() {
  const { user, userData } = useAuth();
  const [products, setProducts]       = useState<Product[]>([]);
  const [sellers, setSellers]         = useState<SellerProfile[]>([]);
  const [sponsored, setSponsored]     = useState<SellerProfile[]>([]);
  const [banners, setBanners]         = useState<Banner[]>([]);
  const [videos, setVideos]           = useState<Video[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sellerCount, setSellerCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab]     = useState<"home"|"reels"|"market"|"messages"|"profile">("home");
  const [lang, setLang]               = useState<"fr"|"en">("fr");

  /* Produits */
  useEffect(() => {
    const q = query(collection(db,"products"), where("status","==","ACTIVE"), orderBy("createdAt","desc"), limit(40));
    const u = onSnapshot(q, (s) => { setProducts(s.docs.map(d=>({id:d.id,...d.data()} as Product))); setLoading(false); }, ()=>setLoading(false));
    return ()=>u();
  },[]);

  /* Vendeurs populaires */
  useEffect(() => {
    const q = query(collection(db,"sellerProfiles"), orderBy("totalSales","desc"), limit(10));
    const u = onSnapshot(q, (s) => setSellers(s.docs.map(d=>({id:d.id,...d.data()} as SellerProfile))));
    return ()=>u();
  },[]);

  /* Boutiques sponsorisées */
  useEffect(() => {
    const q = query(collection(db,"sellerProfiles"), where("subscriptionPlan","!=","FREE"), limit(6));
    const u = onSnapshot(q, (s) => setSponsored(s.docs.map(d=>({id:d.id,...d.data()} as SellerProfile))));
    return ()=>u();
  },[]);

  /* Bannières */
  useEffect(() => {
    const q = query(collection(db,"banners"), where("active","==",true), orderBy("priority","asc"), limit(5));
    const u = onSnapshot(q, (s) => setBanners(s.docs.map(d=>({id:d.id,...d.data()} as Banner))));
    return ()=>u();
  },[]);

  /* Vidéos / Reels */
  useEffect(() => {
    const q = query(collection(db,"videos"), where("active","==",true), orderBy("createdAt","desc"), limit(10));
    const u = onSnapshot(q, (s) => setVideos(s.docs.map(d=>({id:d.id,...d.data()} as Video))));
    return ()=>u();
  },[]);

  /* Notifications */
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db,"notifications"), where("userId","==",(user as {uid:string}).uid), where("read","==",false), limit(20));
    const u = onSnapshot(q, (s) => {
      setNotifications(s.docs.map(d=>({id:d.id,...d.data()} as Notification)));
      setUnreadCount(s.docs.length);
    });
    return ()=>u();
  },[user]);

  /* Stats */
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

  const filtered = products.filter(p=>{
    const matchCat    = !activeCategory || p.category===activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isEmpty = !loading && products.length===0 && sellers.length===0;

  const T = {
    fr: {
      search: "Rechercher un produit, vendeur…",
      sponsored: "Boutiques Sponsorisées",
      seeAll: "Voir tout",
      popular: "Produits Populaires",
      shops: "Boutiques Populaires",
      reels: "Reels & Vidéos",
      promos: "Offres & Promotions",
      sell: "Commencer à vendre",
      sellDesc: "Rejoignez des milliers de vendeurs. Paiement sécurisé, commission transparente.",
      emptyTitle: "Bienvenue sur Mokolo Market",
      emptyDesc: "La marketplace africaine de confiance. Inscrivez-vous pour publier vos produits et commencer à vendre.",
      register: "S'inscrire maintenant",
      login: "Se connecter",
      home: "Accueil", reelsTab: "Reels", market: "Market", messages: "Messages", profile: "Profil",
    },
    en: {
      search: "Search product, seller…",
      sponsored: "Sponsored Shops",
      seeAll: "See all",
      popular: "Popular Products",
      shops: "Popular Shops",
      reels: "Reels & Videos",
      promos: "Deals & Promotions",
      sell: "Start selling",
      sellDesc: "Join thousands of sellers. Secure payment, transparent commission.",
      emptyTitle: "Welcome to Mokolo Market",
      emptyDesc: "Africa's trusted marketplace. Sign up to publish your products and start selling.",
      register: "Register now",
      login: "Sign in",
      home: "Home", reelsTab: "Reels", market: "Market", messages: "Messages", profile: "Profile",
    },
  }[lang];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; background: #F9F9F9; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        img { display: block; }

        .mm-page { padding-bottom: 70px; min-height: 100vh; background: #F9F9F9; overflow-x: hidden; }

        /* Scroll horizontal sans scrollbar */
        .mm-hscroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
        .mm-hscroll::-webkit-scrollbar { display: none; }
        .mm-hscroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* Grille produits */
        .mm-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        @media(min-width:600px){ .mm-grid { grid-template-columns: repeat(3,1fr); } }
        @media(min-width:900px){ .mm-grid { grid-template-columns: repeat(4,1fr); } }

        /* Hover produit */
        .mm-pcard { transition: all 0.2s ease; }
        .mm-pcard:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
        .mm-pcard:hover .mm-cta { background: #D72638 !important; color: #fff !important; }

        /* Carrousel infini */
        @keyframes mmSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes mmPulse { 0%,100%{opacity:.45} 50%{opacity:.85} }
        @keyframes mmFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* Bottom nav */
        .mm-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: #fff; border-top: 1px solid #E5E5E5;
          display: flex; align-items: center;
          height: 62px; padding: 0 4px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        }
        .mm-nav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          padding: 6px 4px; position: relative;
        }
        .mm-nav-icon { font-size: 1.3rem; line-height: 1; }
        .mm-nav-label { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.02em; }
        .mm-nav-dot {
          position: absolute; top: 4px; right: calc(50% - 14px);
          background: #D72638; color: #fff;
          font-size: 0.55rem; font-weight: 800;
          min-width: 14px; height: 14px;
          border-radius: 99px; padding: 0 3px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Section header */
        .mm-sec-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .mm-sec-title {
          font-family: var(--font-heading,'Montserrat',sans-serif);
          font-size: clamp(0.95rem,3vw,1.15rem);
          font-weight: 900; color: #0F0F0F;
        }
        .mm-see-all {
          font-size: 0.75rem; font-weight: 600;
          color: #D72638; display: flex; align-items: center; gap: 3px;
        }

        /* Badge vérifié */
        .mm-verified { color: #2563EB; font-size: 0.85rem; }

        /* Catégories scroll */
        .mm-cats { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
        .mm-cats::-webkit-scrollbar { display: none; }
        .mm-cats { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mm-page">

        {/* ══ HEADER ══ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: MM.white, borderBottom: `1px solid ${MM.gray200}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {/* Ligne 1 : Logo + Actions */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px 6px",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
                fontWeight: 900, fontSize: "1.2rem",
                color: MM.black, letterSpacing: "0.03em",
                lineHeight: 1,
              }}>
                MOKOLO <span style={{ color: MM.red }}>MARKET</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: MM.gray600, marginTop: 1 }}>
                {lang === "fr" ? "Votre marketplace africaine" : "Your African marketplace"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Langue */}
              <button onClick={() => setLang(lang==="fr"?"en":"fr")} style={{
                background: MM.gray100, borderRadius: 6,
                padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, color: MM.black,
              }}>
                {lang.toUpperCase()}
              </button>

              {/* Notifications */}
              <button style={{ position: "relative", padding: 6 }}>
                <span style={{ fontSize: "1.25rem" }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    background: MM.red, color: MM.white,
                    fontSize: "0.55rem", fontWeight: 800,
                    minWidth: 14, height: 14, borderRadius: 99,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px",
                  }}>{unreadCount}</span>
                )}
              </button>

              {/* Messages */}
              <button style={{ padding: 6 }}>
                <span style={{ fontSize: "1.25rem" }}>💬</span>
              </button>

              {/* Panier */}
              <button style={{ padding: 6 }}>
                <span style={{ fontSize: "1.25rem" }}>🛒</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Recherche */}
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
                placeholder={T.search}
                style={{
                  flex: 1, background: "none", border: "none",
                  fontSize: "0.82rem", color: MM.black, outline: "none",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ fontSize: "1rem", color: MM.gray600 }}>×</button>
              )}
              <div style={{ width: 1, height: 20, background: MM.gray200, margin: "0 10px" }} />
              <button style={{ fontSize: "0.9rem", color: MM.gray600 }}>⚙️</button>
            </div>
          </div>
        </header>

        {/* ══ CONTENU VIDE — invitation à s'inscrire ══ */}
        {isEmpty && (
          <div style={{ padding: "48px 20px", textAlign: "center", animation: "mmFadeUp 0.5s ease both" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🛍️</div>
            <h2 style={{
              fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
              fontSize: "1.3rem", fontWeight: 900, color: MM.black, marginBottom: 10,
            }}>{T.emptyTitle}</h2>
            <p style={{ color: MM.gray600, fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 300, margin: "0 auto 24px" }}>
              {T.emptyDesc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
              <Link href="/auth?mode=seller" style={{
                background: MM.red, color: MM.white,
                padding: "13px 24px", borderRadius: 10,
                fontWeight: 700, fontSize: "0.9rem", textAlign: "center",
                boxShadow: "0 4px 16px rgba(215,38,56,0.35)",
              }}>{T.register}</Link>
              <Link href="/auth" style={{
                background: MM.white, color: MM.black,
                border: `1.5px solid ${MM.gray200}`,
                padding: "12px 24px", borderRadius: 10,
                fontWeight: 600, fontSize: "0.9rem", textAlign: "center",
              }}>{T.login}</Link>
            </div>
          </div>
        )}

        {/* ══ CONTENU PRINCIPAL (visible uniquement si contenu existe) ══ */}
        {!isEmpty && (
          <>
            {/* Catégories */}
            <div style={{ padding: "14px 16px 10px", background: MM.white, borderBottom: `1px solid ${MM.gray200}` }}>
              <div className="mm-cats">
                {CATEGORIES.map(c => {
                  const isActive = activeCategory===c.label;
                  return (
                    <button key={c.label} onClick={()=>setActiveCategory(isActive?null:c.label)} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 13px", borderRadius: 20, flexShrink: 0,
                      fontSize: "0.75rem", fontWeight: 600,
                      border: `1.5px solid ${isActive?MM.red:MM.gray200}`,
                      background: isActive?MM.red:MM.white,
                      color: isActive?MM.white:MM.black,
                      boxShadow: isActive?"0 3px 10px rgba(215,38,56,0.22)":"none",
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
              <section style={{ padding: "18px 16px 14px", background: MM.white, marginTop: 8, borderRadius: 0 }}>
                <div className="mm-sec-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      background: MM.black, borderRadius: 8,
                      width: 28, height: 28,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "0.85rem" }}>⭐</span>
                    </div>
                    <span className="mm-sec-title">{T.sponsored}</span>
                  </div>
                  <Link href="/boutiques" className="mm-see-all">{T.seeAll} →</Link>
                </div>

                <div className="mm-hscroll">
                  {sponsored.map(s => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} style={{
                      flexShrink: 0, width: 280,
                      background: MM.white,
                      border: `1px solid ${MM.gray200}`,
                      borderRadius: 14, overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    }}>
                      {/* Bannière boutique */}
                      <div style={{
                        height: 90, background: `linear-gradient(135deg, ${MM.black}, ${MM.redDark})`,
                        position: "relative",
                      }}>
                        <span style={{
                          position: "absolute", top: 8, left: 8,
                          background: MM.red, color: MM.white,
                          fontSize: "0.6rem", fontWeight: 800,
                          padding: "2px 8px", borderRadius: 4,
                          letterSpacing: "0.08em",
                        }}>→ Sponsorisé</span>
                        <span style={{
                          position: "absolute", top: 8, right: 8,
                          background: "rgba(255,200,0,0.15)", color: "#F59E0B",
                          border: "1px solid #F59E0B44",
                          fontSize: "0.6rem", fontWeight: 700,
                          padding: "2px 7px", borderRadius: 4,
                        }}>★ Boutique recommandée</span>
                      </div>

                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* Logo */}
                          <div style={{
                            width: 42, height: 42, borderRadius: 10,
                            background: s.logoUrl ? "transparent" : MM.red,
                            overflow: "hidden", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `2px solid ${MM.white}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            marginTop: -26, position: "relative", zIndex: 1,
                          }}>
                            {s.logoUrl
                              ? <img src={s.logoUrl} alt={s.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <span style={{ color: MM.white, fontWeight: 900, fontSize: "1rem" }}>
                                  {s.shopName.charAt(0).toUpperCase()}
                                </span>
                            }
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{s.shopName}</span>
                              {s.badge && s.badge !== "NONE" && <span className="mm-verified">✓</span>}
                            </div>
                            {s.city && <div style={{ fontSize: "0.68rem", color: MM.gray600 }}>📍 {s.city}</div>}
                          </div>
                        </div>
                        <div style={{
                          marginTop: 10, display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                        }}>
                          <span style={{ fontSize: "0.72rem", color: MM.gray600, lineHeight: 1.4, maxWidth: 160 }}>
                            Mokolo vous encourage à acheter ici
                          </span>
                          <span style={{
                            background: MM.redLight, color: MM.red,
                            fontSize: "0.72rem", fontWeight: 700,
                            padding: "5px 12px", borderRadius: 20,
                          }}>
                            Acheter
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── EXPLORER LES BOUTIQUES CTA ── */}
            {sellers.length > 0 && (
              <Link href="/boutiques" style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                margin: "8px 16px",
                background: MM.white,
                border: `1px solid ${MM.gray200}`,
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: MM.redLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>🏪</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      {lang==="fr" ? "Retrouvez toutes les boutiques" : "Find all shops on"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: MM.gray600 }}>Mokolo Market</div>
                  </div>
                </div>
                <span style={{
                  background: MM.black, color: MM.white,
                  padding: "7px 14px", borderRadius: 20,
                  fontSize: "0.75rem", fontWeight: 700,
                }}>
                  {lang==="fr" ? "Explorer →" : "Explore →"}
                </span>
              </Link>
            )}

            {/* ── PRODUITS POPULAIRES ── */}
            {(loading || filtered.length > 0) && (
              <section style={{ padding: "18px 16px 0" }}>
                <div className="mm-sec-header">
                  <span className="mm-sec-title">
                    🔥 {activeCategory ?? T.popular}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {activeCategory && (
                      <button onClick={()=>setActiveCategory(null)} style={{
                        background: MM.redLight, color: MM.red,
                        border: `1px solid ${MM.red}30`,
                        borderRadius: 7, padding: "4px 9px",
                        fontSize: "0.7rem", fontWeight: 600,
                      }}>×</button>
                    )}
                    <Link href="/produits" className="mm-see-all">{T.seeAll} →</Link>
                  </div>
                </div>

                {loading ? <SkeletonGrid /> : (
                  <div className="mm-grid">
                    {filtered.map((product, i) => (
                      <React.Fragment key={product.id}>
                        <ProductCard product={product} />
                        {(i+1)%5===0 && banners[Math.floor(i/5)] && (
                          <div style={{ gridColumn:"1/-1" }}>
                            <BannerCard banner={banners[Math.floor(i/5)]} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── REELS & VIDÉOS ── */}
            {videos.length > 0 && (
              <section style={{ padding: "22px 16px 0" }}>
                <div className="mm-sec-header">
                  <span className="mm-sec-title">🎬 {T.reels}</span>
                  <Link href="/reels" className="mm-see-all">{T.seeAll} →</Link>
                </div>
                <div className="mm-hscroll">
                  {videos.map(v => (
                    <Link key={v.id} href={`/reels/${v.id}`} style={{
                      flexShrink: 0, width: 130,
                      borderRadius: 12, overflow: "hidden",
                      position: "relative",
                      aspectRatio: "9/16",
                      background: MM.black,
                      display: "block",
                    }}>
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt={v.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <span style={{ fontSize:"2rem" }}>🎬</span>
                          </div>
                      }
                      <div style={{
                        position:"absolute", inset:0,
                        background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                      }} />
                      <div style={{ position:"absolute", bottom:8, left:8, right:8 }}>
                        <div style={{ fontSize:"0.68rem", fontWeight:600, color:MM.white, lineHeight:1.3 }}>
                          {v.title}
                        </div>
                        {v.shopName && (
                          <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.7)", marginTop:2 }}>
                            🏪 {v.shopName}
                          </div>
                        )}
                      </div>
                      {/* Play button */}
                      <div style={{
                        position:"absolute", top:"50%", left:"50%",
                        transform:"translate(-50%,-60%)",
                        width:36, height:36, borderRadius:"50%",
                        background:"rgba(255,255,255,0.25)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <span style={{ fontSize:"1rem", marginLeft:2 }}>▶</span>
                      </div>
                      {v.type==="REEL" && (
                        <span style={{
                          position:"absolute", top:8, left:8,
                          background:MM.red, color:MM.white,
                          fontSize:"0.55rem", fontWeight:800,
                          padding:"2px 6px", borderRadius:4,
                        }}>REEL</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── BOUTIQUES POPULAIRES ── */}
            {sellers.length > 0 && (
              <section style={{ padding: "22px 16px 0" }}>
                <div className="mm-sec-header">
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span className="mm-sec-title">🏪 {T.shops}</span>
                    <span style={{
                      background:MM.red, color:MM.white,
                      fontSize:"0.6rem", fontWeight:800,
                      padding:"2px 8px", borderRadius:20,
                      display:"flex", alignItems:"center", gap:3,
                    }}>
                      ● Statuts
                    </span>
                  </div>
                  <Link href="/boutiques" className="mm-see-all">{T.seeAll} +</Link>
                </div>

                <div className="mm-grid">
                  {sellers.slice(0,6).map(s => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} style={{
                      background:MM.white,
                      border:`1px solid ${MM.gray200}`,
                      borderRadius:12, padding:"14px 10px",
                      display:"flex", flexDirection:"column",
                      alignItems:"center", textAlign:"center",
                      gap:6,
                      boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                      transition:"all 0.18s",
                    }}>
                      <div style={{
                        width:52, height:52, borderRadius:14,
                        background: s.logoUrl?"transparent":MM.red,
                        overflow:"hidden",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 3px 10px rgba(0,0,0,0.12)",
                      }}>
                        {s.logoUrl
                          ? <img src={s.logoUrl} alt={s.shopName} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          : <span style={{color:MM.white,fontWeight:900,fontSize:"1.2rem"}}>
                              {s.shopName.charAt(0).toUpperCase()}
                            </span>
                        }
                      </div>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                          <span style={{ fontWeight:700, fontSize:"0.78rem" }}>{s.shopName}</span>
                          {s.badge && s.badge!=="NONE" && <span className="mm-verified">✓</span>}
                        </div>
                        {s.city && (
                          <div style={{ fontSize:"0.65rem", color:MM.gray600, marginTop:2 }}>
                            📍 {s.city}
                          </div>
                        )}
                        <div style={{ fontSize:"0.65rem", color:"#F59E0B", marginTop:3 }}>
                          ★ {s.rating?.toFixed(1) ?? "0.0"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── CTA VENDEUR ── */}
            <section style={{
              margin:"22px 16px 0",
              background:`linear-gradient(135deg, ${MM.black} 0%, #1a0205 100%)`,
              borderRadius:16, padding:"24px 20px",
              border:`1px solid ${MM.red}30`,
            }}>
              <h2 style={{
                fontFamily:"var(--font-heading,'Montserrat',sans-serif)",
                fontSize:"clamp(1rem,4vw,1.35rem)",
                fontWeight:900, color:MM.white, marginBottom:8,
              }}>{T.sell}</h2>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.82rem", marginBottom:18, lineHeight:1.6 }}>
                {T.sellDesc}
              </p>
              <Link href="/auth?mode=seller" style={{
                display:"inline-block",
                background:MM.red, color:MM.white,
                padding:"11px 24px", borderRadius:10,
                fontWeight:700, fontSize:"0.875rem",
                boxShadow:"0 4px 16px rgba(215,38,56,0.4)",
              }}>
                {lang==="fr" ? "Ouvrir ma boutique →" : "Open my shop →"}
              </Link>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ padding:"24px 16px 16px", marginTop:22 }}>
              <p style={{
                fontFamily:"var(--font-heading,'Montserrat',sans-serif)",
                fontWeight:900, fontSize:"1rem", color:MM.black, marginBottom:4,
              }}>
                MOKOLO <span style={{color:MM.red}}>MARKET</span>
              </p>
              <p style={{color:MM.gray600,fontSize:"0.72rem",marginBottom:14}}>
                {lang==="fr" ? "La marketplace africaine de confiance" : "Africa's trusted marketplace"}
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:16}}>
                {[
                  {href:"/auth",label:lang==="fr"?"Connexion":"Sign in"},
                  {href:"/auth?mode=seller",label:lang==="fr"?"Devenir vendeur":"Become a seller"},
                  {href:"/aide",label:lang==="fr"?"Aide":"Help"},
                  {href:"/contact",label:"Contact"},
                ].map(l=>(
                  <Link key={l.href} href={l.href}
                    style={{color:MM.gray600,fontSize:"0.78rem",fontWeight:500}}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <p style={{color:MM.gray200,fontSize:"0.68rem"}}>
                © {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé
              </p>
            </footer>
          </>
        )}
      </div>

      {/* ══ BOTTOM NAVIGATION ══ */}
      <nav className="mm-bottom-nav">
        {([
          {key:"home",    icon:"🏠", labelFr:"Accueil",  labelEn:"Home"    },
          {key:"reels",   icon:"🎬", labelFr:"Reels",    labelEn:"Reels"   },
          {key:"market",  icon:"🏪", labelFr:"Market",   labelEn:"Market"  },
          {key:"messages",icon:"💬", labelFr:"Messages", labelEn:"Messages"},
          {key:"profile", icon:"👤", labelFr:"Profil",   labelEn:"Profile" },
        ] as {key:typeof activeTab; icon:string; labelFr:string; labelEn:string}[]).map(tab => {
          const isActive = activeTab===tab.key;
          return (
            <button
              key={tab.key}
              onClick={()=>setActiveTab(tab.key)}
              className="mm-nav-item"
              style={{ color: isActive ? MM.red : MM.gray600 }}
            >
              {tab.key==="messages" && unreadCount>0 && (
                <span className="mm-nav-dot">{unreadCount}</span>
              )}
              <span className="mm-nav-icon">{tab.icon}</span>
              <span className="mm-nav-label" style={{
                fontWeight: isActive ? 700 : 500,
              }}>
                {lang==="fr" ? tab.labelFr : tab.labelEn}
              </span>
              {isActive && (
                <div style={{
                  position:"absolute", bottom:0, left:"50%",
                  transform:"translateX(-50%)",
                  width:20, height:3, borderRadius:99,
                  background:MM.red,
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────
   CARTE PRODUIT
───────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const lowestPrice = product.priceTiers?.[0]?.price;
  const hasB2B = (product.priceTiers?.length??0) >= 3;
  return (
    <Link href={`/produits/${product.id}`} className="mm-pcard" style={{
      background:MM.white, border:`1px solid ${MM.gray200}`,
      borderRadius:12, overflow:"hidden",
      display:"flex", flexDirection:"column",
      boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ width:"100%", aspectRatio:"1/1", background:MM.gray100, position:"relative", overflow:"hidden" }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:"2rem"}}>📦</span>
            </div>
        }
        {hasB2B && (
          <span style={{
            position:"absolute", top:6, right:6,
            background:MM.blue, color:MM.white,
            fontSize:"0.58rem", fontWeight:800,
            padding:"2px 5px", borderRadius:4,
          }}>B2B</span>
        )}
      </div>
      <div style={{padding:"9px 10px",flex:1}}>
        <p style={{fontSize:"0.6rem",color:MM.gray600,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{product.category}</p>
        <h3 style={{fontSize:"0.78rem",fontWeight:600,lineHeight:1.3,marginBottom:5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{product.title}</h3>
        {product.shopName && <p style={{fontSize:"0.65rem",color:MM.gray600,marginBottom:5}}>🏪 {product.shopName}</p>}
        {(product.priceTiers?.length??0)>=3 ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
            {product.priceTiers.slice(0,3).map((t,i)=>(
              <div key={i} style={{border:`1px solid ${i===1?MM.red:i===2?MM.green:MM.gray200}`,borderRadius:5,padding:"3px 4px",textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:"0.68rem",color:i===1?MM.red:i===2?MM.green:MM.black}}>{t.price.toLocaleString()} F</div>
                <div style={{fontSize:"0.58rem",color:MM.gray600}}>{t.minQty}+ u</div>
              </div>
            ))}
          </div>
        ) : lowestPrice ? (
          <p style={{fontFamily:"var(--font-heading,'Montserrat',sans-serif)",fontSize:"0.9rem",fontWeight:800,color:MM.red}}>
            {lowestPrice.toLocaleString()} <span style={{fontSize:"0.65rem",color:MM.gray600}}>FCFA</span>
          </p>
        ) : null}
      </div>
      <div style={{padding:"0 10px 10px"}}>
        <div className="mm-cta" style={{
          textAlign:"center",padding:"7px",borderRadius:7,
          fontSize:"0.72rem",fontWeight:700,
          border:`1.5px solid ${MM.red}`,color:MM.red,
          transition:"all 0.2s",
        }}>
          Voir le produit
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   BANNIÈRE
───────────────────────────────────────── */
function BannerCard({ banner }: { banner: Banner }) {
  return (
    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" style={{
      display:"block", position:"relative", borderRadius:12, overflow:"hidden",
      height:"clamp(90px,16vw,140px)", marginBottom:4,
      background:`linear-gradient(135deg, ${MM.black}, ${MM.redDark})`,
    }}>
      {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />}
      {!banner.imageUrl && (
        <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:MM.white,fontWeight:700,fontSize:"0.9rem"}}>{banner.title}</span>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:"0.72rem",marginTop:4}}>{banner.shopName}</span>
        </div>
      )}
      <span style={{
        position:"absolute",top:8,left:10,
        background:"rgba(0,0,0,0.55)",color:"rgba(255,255,255,0.75)",
        fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.1em",
        textTransform:"uppercase",padding:"2px 7px",borderRadius:4,
      }}>Sponsorisé</span>
    </a>
  );
}

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="mm-grid">
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{background:MM.white,borderRadius:12,border:`1px solid ${MM.gray200}`,overflow:"hidden"}}>
          <div style={{width:"100%",aspectRatio:"1/1",background:MM.gray100,animation:"mmPulse 1.5s ease-in-out infinite"}} />
          <div style={{padding:10}}>
            <div style={{height:9,width:"55%",background:MM.gray100,borderRadius:4,marginBottom:7,animation:"mmPulse 1.5s ease-in-out infinite"}} />
            <div style={{height:13,width:"90%",background:MM.gray100,borderRadius:4,marginBottom:7,animation:"mmPulse 1.5s ease-in-out infinite"}} />
            <div style={{height:11,width:"40%",background:MM.gray100,borderRadius:4,animation:"mmPulse 1.5s ease-in-out infinite"}} />
          </div>
        </div>
      ))}
    </div>
  );
}
