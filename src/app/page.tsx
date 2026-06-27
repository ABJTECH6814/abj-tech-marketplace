"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
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
interface Banner {
  id: string; imageUrl: string; linkUrl: string;
  title: string; shopName: string;
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
  const [products, setProducts]           = useState<Product[]>([]);
  const [banners, setBanners]             = useState<Banner[]>([]);
  const [sellerCount, setSellerCount]     = useState<number | null>(null);
  const [productCount, setProductCount]   = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [menuOpen, setMenuOpen]           = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "ACTIVE"),
      orderBy("createdAt", "desc"),
      limit(40)
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "banners"),
      where("active", "==", true),
      orderBy("priority", "asc"),
      limit(6)
    );
    const unsub = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          getCountFromServer(collection(db, "sellerProfiles")),
          getCountFromServer(query(collection(db, "products"), where("status", "==", "ACTIVE"))),
        ]);
        setSellerCount(s.data().count);
        setProductCount(p.data().count);
      } catch {}
    })();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat    = !activeCategory || p.category === activeCategory;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; }
        img { display: block; }

        @keyframes mmSlide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mmPulse {
          0%,100% { opacity: .5; }
          50%     { opacity: .9; }
        }
        @keyframes mmFadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Masquer sidebar sur mobile */
        .mm-sidebar { display: none; }
        @media(min-width: 1024px) {
          .mm-sidebar { display: block; }
        }

        /* Grille produits */
        .mm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media(min-width: 640px) {
          .mm-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        @media(min-width: 1024px) {
          .mm-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }

        /* Stats grid */
        .mm-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media(min-width: 640px) {
          .mm-stats { grid-template-columns: repeat(4, 1fr); }
        }

        /* Hero CTAs */
        .mm-hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        @media(min-width: 480px) {
          .mm-hero-ctas { flex-direction: row; width: auto; }
        }

        /* Carrousel carte */
        .mm-ccard {
          width: 160px;
          flex-shrink: 0;
        }
        @media(min-width: 640px) {
          .mm-ccard { width: 200px; }
        }

        /* Hover carte produit */
        .mm-pcard:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.12) !important;
          transform: translateY(-3px);
        }
        .mm-pcard:hover .mm-cta-inner {
          background: ${MM.red} !important;
          color: ${MM.white} !important;
        }

        /* Menu mobile */
        .mm-mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: ${MM.blackSoft};
          padding: 80px 24px 24px;
          flex-direction: column;
          gap: 20px;
        }
        .mm-mobile-menu.open { display: flex; }

        /* Scroll catégories sans scrollbar visible */
        .mm-cat-scroll::-webkit-scrollbar { display: none; }
        .mm-cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: MM.gray50, overflowX: "hidden" }}>

        {/* ══ NAVBAR ══ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: MM.blackSoft,
          height: 58,
          display: "flex", alignItems: "center",
          gap: 10,
          padding: "0 16px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.22)",
        }}>
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, lineHeight: 1 }}>
            <div style={{ color: MM.white, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.05em", fontFamily: "var(--font-heading,'Montserrat',sans-serif)" }}>
              MOKOLO
            </div>
            <div style={{ color: MM.red, fontWeight: 500, fontSize: "0.58rem", letterSpacing: "0.22em", marginTop: -1 }}>
              MARKET
            </div>
          </Link>

          {/* Recherche */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 8, padding: "0 10px", height: 36,
          }}>
            <span style={{ fontSize: "0.85rem", marginRight: 7, opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                flex: 1, background: "none", border: "none",
                color: MM.white, fontSize: "0.82rem", outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>
                ×
              </button>
            )}
          </div>

          {/* Actions desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {user ? (
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", display: "none" }}
                className="mm-desktop-only">
                👋 {(userData as {firstName?:string})?.firstName}
              </span>
            ) : (
              <>
                <Link href="/auth"
                  style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", fontWeight: 500, display: "none" }}
                  className="mm-desktop-only">
                  Connexion
                </Link>
                <Link href="/auth?mode=seller"
                  style={{
                    background: MM.red, color: MM.white,
                    padding: "7px 14px", borderRadius: 7,
                    fontSize: "0.78rem", fontWeight: 700,
                    boxShadow: "0 2px 10px rgba(215,38,56,0.35)",
                  }}>
                  Vendre
                </Link>
              </>
            )}

            {/* Burger menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none", border: "none",
                color: MM.white, fontSize: "1.3rem",
                padding: "4px 6px",
              }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        {/* Menu mobile overlay */}
        <div className={`mm-mobile-menu${menuOpen ? " open" : ""}`}>
          <button onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: MM.white, fontSize: "1.5rem" }}>
            ✕
          </button>
          {[
            { href: "/", label: "🏠 Accueil" },
            { href: "/auth", label: "🔑 Connexion" },
            { href: "/auth?mode=seller", label: "🏪 Devenir vendeur" },
            { href: "/aide", label: "❓ Aide" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: MM.white, fontSize: "1rem", fontWeight: 600, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* ══ HERO ══ */}
        <section style={{
          background: `linear-gradient(145deg, ${MM.black} 0%, #1a0205 60%, #2a0508 100%)`,
          padding: "32px 16px 28px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Lueur rouge */}
          <div style={{
            position: "absolute", top: "-30%", right: "-5%",
            width: "50%", height: "160%",
            background: `radial-gradient(ellipse, ${MM.red}28 0%, transparent 65%)`,
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
            {/* Badge */}
            <span style={{
              display: "inline-block",
              background: `${MM.red}20`, color: MM.red,
              border: `1px solid ${MM.red}40`,
              borderRadius: 20, padding: "4px 12px",
              fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.06em", marginBottom: 14,
            }}>
              🇨🇲 Marketplace #1 au Cameroun
            </span>

            {/* Titre */}
            <h1 style={{
              fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
              fontSize: "clamp(1.75rem,6vw,3rem)",
              fontWeight: 900, color: MM.white,
              lineHeight: 1.15, marginBottom: 12,
            }}>
              Achetez & vendez<br />
              <span style={{ color: MM.red }}>en toute confiance</span>
            </h1>

            {/* Sous-titre */}
            <p style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "clamp(0.8rem,2.5vw,0.95rem)",
              marginBottom: 24, lineHeight: 1.6,
            }}>
              Paiement séquestré garanti · MTN MoMo · Orange Money · Livraison 48h
            </p>

            {/* CTAs */}
            <div className="mm-hero-ctas">
              <Link href="#catalogue" style={{
                background: MM.red, color: MM.white,
                padding: "13px 28px", borderRadius: 10,
                fontWeight: 700, fontSize: "0.9rem",
                boxShadow: "0 4px 18px rgba(215,38,56,0.4)",
                textAlign: "center",
              }}>
                Explorer les produits
              </Link>
              <Link href="/auth?mode=seller" style={{
                background: "rgba(255,255,255,0.08)",
                color: MM.white,
                border: "1.5px solid rgba(255,255,255,0.18)",
                padding: "13px 24px", borderRadius: 10,
                fontWeight: 600, fontSize: "0.9rem",
                textAlign: "center",
              }}>
                Devenir vendeur →
              </Link>
            </div>

            {/* Stats */}
            <div className="mm-stats" style={{ marginTop: 24 }}>
              {[
                { v: sellerCount === null ? "—" : sellerCount.toLocaleString(), l: "Vendeurs actifs" },
                { v: productCount === null ? "—" : productCount.toLocaleString(), l: "Produits en ligne" },
                { v: "48h",   l: "Livraison standard" },
                { v: "100%",  l: "Paiement sécurisé"  },
              ].map((s) => (
                <div key={s.l} style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{
                    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
                    fontSize: "clamp(1.2rem,4vw,1.6rem)",
                    fontWeight: 900, color: MM.white,
                  }}>{s.v}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CATÉGORIES ══ */}
        <section style={{
          background: MM.white,
          borderBottom: `1px solid ${MM.gray200}`,
          padding: "10px 16px",
          position: "sticky", top: 58, zIndex: 90,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <div className="mm-cat-scroll" style={{
            display: "flex", gap: 8,
            overflowX: "auto", paddingBottom: 2,
          }}>
            {CATEGORIES.map((c) => {
              const isActive = activeCategory === c.label;
              return (
                <button key={c.label} onClick={() => setActiveCategory(isActive ? null : c.label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 13px", borderRadius: 20,
                    fontSize: "0.78rem", fontWeight: 600,
                    whiteSpace: "nowrap", flexShrink: 0,
                    border: `1.5px solid ${isActive ? MM.red : MM.gray200}`,
                    background: isActive ? MM.red : MM.white,
                    color: isActive ? MM.white : MM.black,
                    boxShadow: isActive ? "0 3px 12px rgba(215,38,56,0.25)" : "none",
                    transition: "all 0.18s",
                  }}>
                  <span>{c.icon}</span><span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ══ CARROUSEL INFINI ══ */}
        {!loading && products.length > 0 && (
          <section style={{ padding: "24px 0 0 16px", overflow: "hidden" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              paddingRight: 16, marginBottom: 14,
            }}>
              <h2 style={{
                fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
                fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 900,
              }}>
                Arrivages récents
              </h2>
              <span style={{ fontSize: "0.75rem", color: MM.gray600 }}>En continu ↔</span>
            </div>

            <div style={{ overflow: "hidden" }}>
              <div style={{
                display: "flex", gap: 12,
                animation: "mmSlide 35s linear infinite",
                width: "max-content",
              }}>
                {[...products, ...products].map((p, i) => (
                  <div key={`${p.id}-${i}`} className="mm-ccard" style={{
                    background: MM.white,
                    border: `1px solid ${MM.gray200}`,
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    <div style={{
                      width: "100%", aspectRatio: "1/1",
                      background: MM.gray100,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "1.8rem" }}>📦</span>
                      }
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      <p style={{ fontSize: "0.65rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
                        {p.category}
                      </p>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </p>
                      {p.priceTiers?.[0] && (
                        <p style={{ fontSize: "0.82rem", fontWeight: 800, color: MM.red, marginTop: 4 }}>
                          {p.priceTiers[0].price.toLocaleString()} <span style={{ fontSize: "0.65rem" }}>FCFA</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ CATALOGUE ══ */}
        <section id="catalogue" style={{ padding: "24px 16px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 16,
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
              fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 900,
            }}>
              {activeCategory ?? "Tous les produits"}
            </h2>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} style={{
                background: MM.redLight, color: MM.red,
                border: `1px solid ${MM.red}30`,
                borderRadius: 8, padding: "5px 10px",
                fontSize: "0.75rem", fontWeight: 600,
              }}>
                Voir tout ×
              </button>
            )}
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <EmptyState search={search} category={activeCategory} />
          ) : (
            <div className="mm-grid">
              {filtered.map((product, i) => (
                <React.Fragment key={product.id}>
                  <ProductCard product={product} />
                  {(i + 1) % 5 === 0 && banners[Math.floor(i / 5)] && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <BannerCard banner={banners[Math.floor(i / 5)]} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

        {/* ══ CTA VENDEUR ══ */}
        <section style={{
          margin: "0 16px 24px",
          background: `linear-gradient(135deg, ${MM.black} 0%, #1a0205 100%)`,
          borderRadius: 16, padding: "28px 20px",
          border: `1px solid ${MM.red}30`,
        }}>
          <h2 style={{
            fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
            fontSize: "clamp(1.1rem,4vw,1.5rem)",
            fontWeight: 900, color: MM.white,
            marginBottom: 10,
          }}>
            Vous avez des produits à vendre ?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.85rem", marginBottom: 20, lineHeight: 1.6,
          }}>
            Rejoignez des milliers de vendeurs sur Mokolo Market. Paiement sécurisé, commission transparente, livraison gérée.
          </p>
          <Link href="/auth?mode=seller" style={{
            display: "inline-block",
            background: MM.red, color: MM.white,
            padding: "12px 28px", borderRadius: 10,
            fontWeight: 700, fontSize: "0.9rem",
            boxShadow: "0 4px 18px rgba(215,38,56,0.4)",
          }}>
            Ouvrir ma boutique →
          </Link>
        </section>

        {/* ══ FOOTER ══ */}
        <footer style={{
          background: MM.black,
          padding: "28px 16px 40px",
        }}>
          <p style={{
            fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
            fontWeight: 900, fontSize: "1.1rem",
            color: MM.white, marginBottom: 4,
          }}>
            MOKOLO <span style={{ color: MM.red }}>MARKET</span>
          </p>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.78rem", marginBottom: 20 }}>
            La marketplace africaine de confiance
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            {[
              { href: "/auth",             label: "Connexion"       },
              { href: "/auth?mode=seller", label: "Devenir vendeur" },
              { href: "/aide",             label: "Aide"            },
              { href: "/contact",          label: "Contact"         },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.82rem", fontWeight: 500 }}>
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.72rem" }}>
            © {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé, Cameroun
          </p>
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   CARTE PRODUIT
───────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const lowestPrice = product.priceTiers?.[0]?.price;
  const hasB2B      = (product.priceTiers?.length ?? 0) >= 3;

  return (
    <Link href={`/produits/${product.id}`}
      className="mm-pcard"
      style={{
        background: MM.white,
        border: `1px solid ${MM.gray200}`,
        borderRadius: 12, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "all 0.2s ease",
      }}>
      {/* Image */}
      <div style={{
        width: "100%", aspectRatio: "1/1",
        background: MM.gray100, position: "relative",
        overflow: "hidden",
      }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2.2rem" }}>📦</span>
            </div>
        }
        {hasB2B && (
          <span style={{
            position: "absolute", top: 7, right: 7,
            background: "#2563EB", color: MM.white,
            fontSize: "0.6rem", fontWeight: 800,
            padding: "2px 6px", borderRadius: 4,
            letterSpacing: "0.05em",
          }}>B2B</span>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: "10px 11px", flex: 1 }}>
        <p style={{ fontSize: "0.62rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
          {product.category}
        </p>
        <h3 style={{
          fontSize: "0.82rem", fontWeight: 600,
          lineHeight: 1.3, marginBottom: 6,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.title}
        </h3>

        {product.shopName && (
          <p style={{ fontSize: "0.68rem", color: MM.gray600, marginBottom: 6 }}>
            🏪 {product.shopName}
          </p>
        )}

        {/* Prix */}
        {(product.priceTiers?.length ?? 0) >= 3 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
            {product.priceTiers.slice(0, 3).map((tier, i) => (
              <div key={i} style={{
                border: `1px solid ${i === 1 ? MM.red : i === 2 ? "#16a34a" : MM.gray200}`,
                borderRadius: 5, padding: "3px 4px",
                textAlign: "center",
              }}>
                <div style={{
                  fontWeight: 800, fontSize: "0.72rem",
                  color: i === 1 ? MM.red : i === 2 ? "#16a34a" : MM.black,
                }}>
                  {tier.price.toLocaleString()} F
                </div>
                <div style={{ fontSize: "0.6rem", color: MM.gray600 }}>
                  {tier.minQty}+ u
                </div>
              </div>
            ))}
          </div>
        ) : lowestPrice ? (
          <p style={{
            fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
            fontSize: "0.95rem", fontWeight: 800, color: MM.red,
          }}>
            {lowestPrice.toLocaleString()} <span style={{ fontSize: "0.7rem", color: MM.gray600 }}>FCFA</span>
          </p>
        ) : null}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 11px 11px" }}>
        <div className="mm-cta-inner" style={{
          textAlign: "center", padding: "7px",
          borderRadius: 7, fontSize: "0.76rem", fontWeight: 700,
          border: `1.5px solid ${MM.red}`, color: MM.red,
          transition: "all 0.2s",
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
    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer"
      style={{
        display: "block", position: "relative",
        borderRadius: 12, overflow: "hidden",
        height: "clamp(100px,18vw,160px)",
        background: `linear-gradient(135deg, ${MM.black}, ${MM.redDark})`,
        marginBottom: 4,
      }}>
      {banner.imageUrl && (
        <img src={banner.imageUrl} alt={banner.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {!banner.imageUrl && (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: MM.white, fontWeight: 700, fontSize: "0.9rem" }}>{banner.title}</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginTop: 4 }}>{banner.shopName}</span>
        </div>
      )}
      <span style={{
        position: "absolute", top: 8, left: 10,
        background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.75)",
        fontSize: "0.6rem", fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "2px 7px", borderRadius: 4,
      }}>
        Sponsorisé
      </span>
    </a>
  );
}

/* ─────────────────────────────────────────
   ÉTATS
───────────────────────────────────────── */
function EmptyState({ search, category }: { search: string; category: string | null }) {
  return (
    <div style={{
      padding: "48px 20px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: "2.8rem" }}>🛍️</span>
      <h3 style={{ fontWeight: 800, fontSize: "1rem" }}>
        {search ? `Aucun résultat pour "${search}"` : category ? `Aucun produit dans "${category}"` : "Aucun produit pour le moment"}
      </h3>
      <p style={{ color: MM.gray600, fontSize: "0.82rem", maxWidth: 280, lineHeight: 1.5 }}>
        {search || category
          ? "Essayez d'autres mots-clés ou parcourez toutes les catégories."
          : "Les vendeurs peuvent publier depuis leur tableau de bord."}
      </p>
      {(search || category) && (
        <Link href="/" style={{
          marginTop: 8, background: MM.red, color: MM.white,
          padding: "10px 22px", borderRadius: 8,
          fontWeight: 700, fontSize: "0.85rem",
        }}>
          Voir tout
        </Link>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="mm-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          background: MM.white, borderRadius: 12,
          border: `1px solid ${MM.gray200}`, overflow: "hidden",
        }}>
          <div style={{
            width: "100%", aspectRatio: "1/1",
            background: MM.gray100,
            animation: "mmPulse 1.5s ease-in-out infinite",
          }} />
          <div style={{ padding: 10 }}>
            <div style={{ height: 10, width: "55%", background: MM.gray100, borderRadius: 4, marginBottom: 8, animation: "mmPulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 14, width: "90%", background: MM.gray100, borderRadius: 4, marginBottom: 8, animation: "mmPulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "40%", background: MM.gray100, borderRadius: 4, animation: "mmPulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
