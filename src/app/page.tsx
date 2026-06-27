"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  collection, onSnapshot, query, where,
  orderBy, limit, getCountFromServer, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import SidebarLeft from "@/components/SidebarLeft";

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
interface Category { label: string; icon: string; }

/* ─────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────── */
const CATEGORIES: Category[] = [
  { label: "Téléphones & Électronique", icon: "📱" },
  { label: "Mode & Vêtements",          icon: "👕" },
  { label: "Maison & Décoration",       icon: "🏠" },
  { label: "Alimentation & Agro",       icon: "🌾" },
  { label: "Beauté & Santé",            icon: "💄" },
  { label: "Services B2B",              icon: "🏢" },
];

const MM = {
  red:       "#D72638",
  redDark:   "#A51C2B",
  redLight:  "#FFF0F2",
  black:     "#0F0F0F",
  blackSoft: "#1A1A1A",
  white:     "#FFFFFF",
  gray50:    "#F9F9F9",
  gray100:   "#F3F4F6",
  gray200:   "#E5E5E5",
  gray600:   "#666666",
  blue:      "#2563EB",
  blueLight: "#EFF6FF",
};

/* ─────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────── */
export default function HomePage() {
  const { user, userData } = useAuth();
  const [products, setProducts]         = useState<Product[]>([]);
  const [banners, setBanners]           = useState<Banner[]>([]);
  const [sellerCount, setSellerCount]   = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);

  /* Produits Firestore */
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

  /* Bannières Firestore */
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

  /* Stats */
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

  /* Filtrage */
  const filtered = products.filter((p) => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Injection bannières toutes les 5 cartes */
  const withBanners: (Product | { type: "banner"; banner: Banner })[] = [];
  filtered.forEach((p, i) => {
    withBanners.push(p);
    if ((i + 1) % 5 === 0 && banners[(i + 1) / 5 - 1]) {
      withBanners.push({ type: "banner", banner: banners[Math.floor(i / 5)] });
    }
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: MM.gray50, color: MM.black }}>
      <SidebarLeft />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* ── NAVBAR FIXE ── */}
        <Navbar user={user} userData={userData} search={search} onSearch={setSearch} />

        <main style={{ flex: 1 }}>
          {/* ── HERO ── */}
          <HeroSection sellerCount={sellerCount} productCount={productCount} />

          {/* ── CATÉGORIES ── */}
          <CategoryStrip
            categories={CATEGORIES}
            active={activeCategory}
            onSelect={(c) => setActiveCategory(activeCategory === c ? null : c)}
          />

          {/* ── CARROUSEL INFINI ── */}
          {!loading && products.length > 0 && (
            <InfiniteCarousel products={products} />
          )}

          {/* ── CATALOGUE + BANNIÈRES ── */}
          <section style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px)" }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                {activeCategory ?? "Tous les produits"}
              </h2>
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} style={styles.clearBtn}>
                  Voir tout ×
                </button>
              )}
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyState search={search} category={activeCategory} />
            ) : (
              <div style={styles.productGrid}>
                {withBanners.map((item, i) => {
                  if ("type" in item && item.type === "banner") {
                    return <BannerCard key={`banner-${i}`} banner={item.banner} />;
                  }
                  return <ProductCard key={(item as Product).id} product={item as Product} />;
                })}
              </div>
            )}
          </section>

          {/* ── CTA VENDEUR ── */}
          <SellerCTA />

          {/* ── FOOTER ── */}
          <Footer />
        </main>
      </div>

      <style>{`
        @keyframes mmSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes mmPulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes mmFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        button { font-family: inherit; }
        a { text-decoration: none; color: inherit; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar({ user, userData, search, onSearch }: {
  user: unknown; userData: { firstName?: string } | null;
  search: string; onSearch: (v: string) => void;
}) {
  return (
    <header style={styles.navbar}>
      {/* Logo mobile */}
      <Link href="/" style={styles.navLogo}>
        <span style={{ color: MM.white, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.04em" }}>MOKOLO</span>
        <span style={{ color: MM.red, fontWeight: 500, fontSize: "0.7rem", letterSpacing: "0.2em", display: "block", marginTop: -2 }}>MARKET</span>
      </Link>

      {/* Barre de recherche */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher un produit, vendeur, catégorie…"
          style={styles.searchInput}
        />
        {search && (
          <button onClick={() => onSearch("")} style={styles.searchClear}>×</button>
        )}
      </div>

      {/* Actions */}
      <div style={styles.navActions}>
        {user ? (
          <span style={styles.navGreet}>
            👋 {(userData as {firstName?:string})?.firstName || "Mon compte"}
          </span>
        ) : (
          <>
            <Link href="/auth" style={styles.navLink}>Connexion</Link>
            <Link href="/auth?mode=seller" style={styles.navCta}>Vendre</Link>
          </>
        )}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function HeroSection({ sellerCount, productCount }: {
  sellerCount: number | null; productCount: number | null;
}) {
  return (
    <section style={styles.hero}>
      {/* Lumière ambiante */}
      <div style={styles.heroGlow} />

      <div style={styles.heroInner}>
        <div style={styles.heroText}>
          <span style={styles.heroBadge}>🇨🇲 Marketplace #1 au Cameroun</span>
          <h1 style={styles.heroTitle}>
            Achetez & vendez<br />
            <span style={{ color: MM.red }}>en toute confiance</span>
          </h1>
          <p style={styles.heroDesc}>
            Paiement séquestré garanti · MTN MoMo · Orange Money · Livraison 48h
          </p>
          <div style={styles.heroCtas}>
            <Link href="#catalogue" style={styles.heroBtnPrimary}>
              Explorer les produits
            </Link>
            <Link href="/auth?mode=seller" style={styles.heroBtnSecondary}>
              Devenir vendeur →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.heroStats}>
          {[
            { value: sellerCount === null ? "—" : sellerCount.toLocaleString(), label: "Vendeurs actifs" },
            { value: productCount === null ? "—" : productCount.toLocaleString(), label: "Produits en ligne" },
            { value: "48h",   label: "Livraison standard" },
            { value: "100%",  label: "Paiement sécurisé"  },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CATÉGORIES
───────────────────────────────────────── */
function CategoryStrip({ categories, active, onSelect }: {
  categories: Category[]; active: string | null; onSelect: (c: string) => void;
}) {
  return (
    <section style={styles.catStrip}>
      <div style={styles.catScroll}>
        {categories.map((c) => {
          const isActive = active === c.label;
          return (
            <button
              key={c.label}
              onClick={() => onSelect(c.label)}
              style={{
                ...styles.catChip,
                background: isActive ? MM.red : MM.white,
                color: isActive ? MM.white : MM.black,
                border: `1.5px solid ${isActive ? MM.red : MM.gray200}`,
                boxShadow: isActive ? "0 4px 14px rgba(215,38,56,0.25)" : "none",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CARROUSEL INFINI
───────────────────────────────────────── */
function InfiniteCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...products, ...products]; // duplication pour l'effet infini

  return (
    <section style={styles.carouselSection}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Arrivages récents</h2>
        <span style={{ fontSize: "0.8rem", color: MM.gray600 }}>Défilement automatique</span>
      </div>
      <div style={styles.carouselViewport}>
        <div ref={trackRef} style={styles.carouselTrack}>
          {doubled.map((p, i) => (
            <div key={`${p.id}-${i}`} style={styles.carouselCard}>
              <div style={styles.carouselImg}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "2rem" }}>📦</span>
                }
              </div>
              <div style={styles.carouselInfo}>
                <p style={styles.carouselCat}>{p.category}</p>
                <p style={styles.carouselName}>{p.title}</p>
                {p.priceTiers?.[0] && (
                  <p style={styles.carouselPrice}>
                    dès {p.priceTiers[0].price.toLocaleString()} <span style={{ fontSize: "0.7rem" }}>FCFA</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CARTE PRODUIT
───────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const lowestPrice = product.priceTiers?.[0]?.price;
  const hasB2B = product.priceTiers?.length >= 3;

  return (
    <Link
      href={`/produits/${product.id}`}
      style={{
        ...styles.productCard,
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={styles.productImgWrap}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.title} style={styles.productImg} />
          : <div style={styles.productImgPlaceholder}><span style={{ fontSize: "2.5rem" }}>📦</span></div>
        }
        {hasB2B && (
          <span style={styles.b2bBadge}>B2B</span>
        )}
      </div>

      {/* Infos */}
      <div style={styles.productBody}>
        <p style={styles.productCat}>{product.category}</p>
        <h3 style={styles.productName}>{product.title}</h3>

        {product.shopName && (
          <p style={styles.productShop}>
            🏪 {product.shopName}
          </p>
        )}

        {/* Prix */}
        {product.priceTiers?.length > 0 && (
          <div style={styles.priceBlock}>
            {product.priceTiers.length >= 3 ? (
              /* 3 niveaux de prix */
              <div style={styles.priceTiers}>
                {product.priceTiers.slice(0, 3).map((tier, i) => (
                  <div key={i} style={{
                    ...styles.priceTier,
                    borderColor: i === 1 ? MM.red : i === 2 ? "#16a34a" : MM.gray200,
                    color: i === 1 ? MM.red : i === 2 ? "#16a34a" : MM.black,
                  }}>
                    <span style={{ fontWeight: 800, fontSize: "0.8rem" }}>
                      {tier.price.toLocaleString()} F
                    </span>
                    <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>
                      {tier.minQty}+ u
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.priceSimple}>
                {lowestPrice?.toLocaleString()} <span style={{ fontSize: "0.75rem", color: MM.gray600 }}>FCFA</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={styles.productCta}>
        <span style={{
          ...styles.ctaBtn,
          background: hovered ? MM.red : "transparent",
          color: hovered ? MM.white : MM.red,
          border: `1.5px solid ${MM.red}`,
        }}>
          Voir le produit
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   BANNIÈRE PUBLICITAIRE
───────────────────────────────────────── */
function BannerCard({ banner }: { banner: Banner }) {
  return (
    <a
      href={banner.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.bannerCard}
    >
      {banner.imageUrl
        ? <img src={banner.imageUrl} alt={banner.title} style={styles.bannerImg} />
        : (
          <div style={styles.bannerPlaceholder}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: MM.white }}>{banner.title}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{banner.shopName}</span>
          </div>
        )
      }
      <div style={styles.bannerOverlay}>
        <span style={styles.bannerLabel}>Sponsorisé</span>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────
   CTA VENDEUR
───────────────────────────────────────── */
function SellerCTA() {
  return (
    <section style={styles.sellerCta}>
      <div style={styles.sellerCtaInner}>
        <div>
          <h2 style={styles.sellerCtaTitle}>Vous avez des produits à vendre ?</h2>
          <p style={styles.sellerCtaDesc}>
            Rejoignez des milliers de vendeurs sur Mokolo Market. Paiement sécurisé, livraison gérée, commission transparente.
          </p>
        </div>
        <Link href="/auth?mode=seller" style={styles.sellerCtaBtn}>
          Ouvrir ma boutique →
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   ÉTATS VIDES & SKELETON
───────────────────────────────────────── */
function EmptyState({ search, category }: { search: string; category: string | null }) {
  return (
    <div style={styles.emptyState}>
      <span style={{ fontSize: "3rem" }}>🛍️</span>
      <h3 style={{ fontWeight: 800, margin: "12px 0 6px", fontSize: "1.1rem" }}>
        {search
          ? `Aucun résultat pour "${search}"`
          : category
          ? `Aucun produit dans "${category}"`
          : "Aucun produit publié pour le moment"}
      </h3>
      <p style={{ color: MM.gray600, fontSize: "0.875rem", maxWidth: 320, textAlign: "center" }}>
        {search || category
          ? "Essayez d'autres mots-clés ou parcourez toutes les catégories."
          : "Les vendeurs inscrits peuvent publier leur premier produit depuis leur tableau de bord."}
      </p>
      {(search || category) && (
        <Link href="/" style={{ ...styles.heroBtnPrimary, marginTop: 16, display: "inline-block" }}>
          Voir tous les produits
        </Link>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={styles.productGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={styles.skeletonCard}>
          <div style={{ ...styles.skeletonBlock, height: 180, borderRadius: 10 }} />
          <div style={{ ...styles.skeletonBlock, height: 14, width: "60%", marginTop: 12 }} />
          <div style={{ ...styles.skeletonBlock, height: 18, width: "90%", marginTop: 8 }} />
          <div style={{ ...styles.skeletonBlock, height: 14, width: "40%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <div>
          <p style={styles.footerLogo}>MOKOLO <span style={{ color: MM.red }}>MARKET</span></p>
          <p style={styles.footerTagline}>La marketplace africaine de confiance</p>
        </div>
        <div style={styles.footerLinks}>
          {[
            { href: "/auth",           label: "Connexion"       },
            { href: "/auth?mode=seller", label: "Devenir vendeur" },
            { href: "/aide",           label: "Aide"            },
            { href: "/contact",        label: "Contact"         },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={styles.footerLink}>{l.label}</Link>
          ))}
        </div>
        <p style={styles.footerCopy}>
          © {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  /* Navbar */
  navbar: {
    position: "sticky", top: 0, zIndex: 100,
    background: MM.blackSoft,
    height: 60,
    display: "flex", alignItems: "center",
    gap: "clamp(8px,2vw,20px)",
    padding: "0 clamp(12px,3vw,24px)",
    borderBottom: `1px solid #ffffff10`,
    boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
  },
  navLogo: {
    flexShrink: 0,
    lineHeight: 1,
    display: "block",
  },
  searchWrap: {
    flex: 1,
    display: "flex", alignItems: "center",
    background: "#ffffff14",
    border: "1px solid #ffffff18",
    borderRadius: 10,
    padding: "0 12px",
    height: 38,
    maxWidth: 560,
  },
  searchIcon: { fontSize: "0.9rem", marginRight: 8, opacity: 0.6 },
  searchInput: {
    flex: 1, background: "none", border: "none",
    color: MM.white, fontSize: "0.875rem",
    "::placeholder": { color: "rgba(255,255,255,0.4)" },
  } as React.CSSProperties,
  searchClear: {
    background: "none", border: "none",
    color: "rgba(255,255,255,0.5)", fontSize: "1.1rem",
    cursor: "pointer", padding: "0 4px",
  },
  navActions: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  navLink: { color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", fontWeight: 500 },
  navCta: {
    background: MM.red, color: MM.white,
    padding: "7px 16px", borderRadius: 8,
    fontSize: "0.8rem", fontWeight: 700,
    boxShadow: "0 2px 10px rgba(215,38,56,0.35)",
  },
  navGreet: { color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" },

  /* Hero */
  hero: {
    background: `linear-gradient(135deg, ${MM.black} 0%, ${MM.blackSoft} 60%, #2a0a0e 100%)`,
    padding: "clamp(32px,6vw,64px) clamp(16px,4vw,40px)",
    position: "relative", overflow: "hidden",
  },
  heroGlow: {
    position: "absolute", top: "-40%", right: "-10%",
    width: "55%", height: "160%",
    background: `radial-gradient(ellipse, ${MM.red}22 0%, transparent 65%)`,
    pointerEvents: "none",
  },
  heroInner: { position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" },
  heroText: { marginBottom: "clamp(24px,4vw,40px)" },
  heroBadge: {
    display: "inline-block",
    background: `${MM.red}22`,
    color: MM.red,
    border: `1px solid ${MM.red}44`,
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: "0.78rem", fontWeight: 700,
    letterSpacing: "0.06em",
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontSize: "clamp(1.8rem,5vw,3.2rem)",
    fontWeight: 900, color: MM.white,
    lineHeight: 1.15, margin: "0 0 16px",
  },
  heroDesc: {
    color: "rgba(255,255,255,0.60)",
    fontSize: "clamp(0.85rem,2vw,1rem)",
    margin: "0 0 28px", lineHeight: 1.6,
  },
  heroCtas: { display: "flex", gap: 12, flexWrap: "wrap" as const },
  heroBtnPrimary: {
    display: "inline-block",
    background: MM.red, color: MM.white,
    padding: "12px 28px", borderRadius: 10,
    fontWeight: 700, fontSize: "0.9rem",
    boxShadow: "0 4px 18px rgba(215,38,56,0.4)",
    transition: "transform 0.15s",
  },
  heroBtnSecondary: {
    display: "inline-block",
    background: "rgba(255,255,255,0.08)",
    color: MM.white,
    border: "1.5px solid rgba(255,255,255,0.20)",
    padding: "12px 24px", borderRadius: 10,
    fontWeight: 600, fontSize: "0.9rem",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))",
    gap: 12,
  },
  statItem: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12, padding: "14px 16px",
    display: "flex", flexDirection: "column" as const, gap: 4,
  },
  statValue: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontSize: "clamp(1.3rem,3vw,1.8rem)",
    fontWeight: 900, color: MM.white,
  },
  statLabel: { fontSize: "0.75rem", color: "rgba(255,255,255,0.50)", letterSpacing: "0.04em" },

  /* Catégories */
  catStrip: {
    background: MM.white,
    borderBottom: `1px solid ${MM.gray200}`,
    padding: "12px clamp(16px,4vw,32px)",
    position: "sticky", top: 60, zIndex: 90,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  catScroll: {
    display: "flex", gap: 8,
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 2,
  },
  catChip: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 20,
    fontSize: "0.8rem", fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap" as const,
    transition: "all 0.2s",
    flexShrink: 0,
  },

  /* Carrousel */
  carouselSection: {
    padding: "clamp(20px,4vw,36px) 0 clamp(20px,4vw,36px) clamp(16px,4vw,32px)",
    overflow: "hidden",
  },
  carouselViewport: { overflow: "hidden", marginTop: 16 },
  carouselTrack: {
    display: "flex", gap: 14,
    animation: "mmSlide 40s linear infinite",
    width: "max-content",
  },
  carouselCard: {
    width: "clamp(150px,38vw,200px)",
    background: MM.white,
    border: `1px solid ${MM.gray200}`,
    borderRadius: 12, overflow: "hidden",
    flexShrink: 0,
  },
  carouselImg: {
    width: "100%", aspectRatio: "1/1",
    background: MM.gray100,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  carouselInfo: { padding: "10px 12px" },
  carouselCat: { fontSize: "0.68rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase" as const, margin: 0 },
  carouselName: { fontSize: "0.8rem", fontWeight: 600, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  carouselPrice: { fontSize: "0.875rem", fontWeight: 800, color: MM.red, margin: "6px 0 0" },

  /* Grille catalogue */
  sectionHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
    padding: "0 clamp(16px,4vw,32px)",
  },
  sectionTitle: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontSize: "clamp(1.1rem,3vw,1.4rem)",
    fontWeight: 900, margin: 0,
  },
  clearBtn: {
    background: MM.redLight, color: MM.red,
    border: `1px solid ${MM.red}30`,
    borderRadius: 8, padding: "6px 12px",
    fontSize: "0.8rem", fontWeight: 600,
    cursor: "pointer",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    padding: "0 clamp(16px,4vw,32px)",
  },

  /* Carte produit */
  productCard: {
    background: MM.white,
    border: `1px solid ${MM.gray200}`,
    borderRadius: 14, overflow: "hidden",
    display: "flex", flexDirection: "column" as const,
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  productImgWrap: {
    width: "100%", aspectRatio: "1/1",
    background: MM.gray100, position: "relative",
    overflow: "hidden",
  },
  productImg: { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
  productImgPlaceholder: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  b2bBadge: {
    position: "absolute", top: 8, right: 8,
    background: MM.blue, color: MM.white,
    fontSize: "0.65rem", fontWeight: 800,
    padding: "3px 7px", borderRadius: 5,
    letterSpacing: "0.05em",
  },
  productBody: { padding: "12px 14px", flex: 1 },
  productCat: { fontSize: "0.68rem", color: MM.gray600, fontWeight: 700, textTransform: "uppercase" as const, margin: 0 },
  productName: { fontSize: "0.875rem", fontWeight: 600, margin: "5px 0 4px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const },
  productShop: { fontSize: "0.72rem", color: MM.gray600, margin: "4px 0 0" },
  priceBlock: { marginTop: 10 },
  priceTiers: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 },
  priceTier: {
    border: `1px solid`,
    borderRadius: 6, padding: "4px 6px",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", textAlign: "center" as const,
  },
  priceSimple: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontSize: "1rem", fontWeight: 800,
    color: MM.red, margin: 0,
  },
  productCta: { padding: "10px 14px 14px" },
  ctaBtn: {
    display: "block", textAlign: "center" as const,
    padding: "8px", borderRadius: 8,
    fontSize: "0.8rem", fontWeight: 700,
    transition: "all 0.2s",
  },

  /* Bannière */
  bannerCard: {
    gridColumn: "1 / -1",
    position: "relative", borderRadius: 14,
    overflow: "hidden", display: "block",
    height: "clamp(120px,20vw,200px)",
    background: `linear-gradient(135deg, ${MM.black}, ${MM.redDark})`,
    cursor: "pointer",
  },
  bannerImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  bannerPlaceholder: {
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", justifyContent: "center",
  },
  bannerOverlay: {
    position: "absolute", top: 10, left: 12,
  },
  bannerLabel: {
    background: "rgba(0,0,0,0.55)",
    color: "rgba(255,255,255,0.80)",
    fontSize: "0.65rem", fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px", borderRadius: 4,
    textTransform: "uppercase" as const,
  },

  /* CTA Vendeur */
  sellerCta: {
    background: `linear-gradient(135deg, ${MM.black} 0%, #1a0508 100%)`,
    margin: "clamp(20px,4vw,40px) clamp(16px,4vw,32px)",
    borderRadius: 16, padding: "clamp(24px,4vw,40px)",
    border: `1px solid ${MM.red}30`,
  },
  sellerCtaInner: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 20,
    flexWrap: "wrap" as const,
  },
  sellerCtaTitle: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontSize: "clamp(1.1rem,3vw,1.5rem)",
    fontWeight: 900, color: MM.white, margin: "0 0 8px",
  },
  sellerCtaDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.875rem", margin: 0, maxWidth: 500,
    lineHeight: 1.6,
  },
  sellerCtaBtn: {
    display: "inline-block",
    background: MM.red, color: MM.white,
    padding: "13px 28px", borderRadius: 10,
    fontWeight: 700, fontSize: "0.9rem",
    boxShadow: "0 4px 18px rgba(215,38,56,0.4)",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  },

  /* Empty */
  emptyState: {
    padding: "60px 20px", textAlign: "center" as const,
    display: "flex", flexDirection: "column" as const,
    alignItems: "center",
  },

  /* Skeleton */
  skeletonCard: {
    background: MM.white, borderRadius: 14,
    padding: 14, border: `1px solid ${MM.gray200}`,
  },
  skeletonBlock: {
    background: MM.gray100, borderRadius: 6,
    animation: "mmPulse 1.5s ease-in-out infinite",
  },

  /* Footer */
  footer: {
    background: MM.black,
    padding: "clamp(24px,4vw,40px) clamp(16px,4vw,32px)",
    marginTop: "clamp(20px,4vw,40px)",
  },
  footerInner: { maxWidth: 900, margin: "0 auto" },
  footerLogo: {
    fontFamily: "var(--font-heading,'Montserrat',sans-serif)",
    fontWeight: 900, fontSize: "1.2rem",
    color: MM.white, margin: "0 0 4px",
  },
  footerTagline: { color: "rgba(255,255,255,0.40)", fontSize: "0.8rem", margin: "0 0 24px" },
  footerLinks: { display: "flex", gap: 20, flexWrap: "wrap" as const, marginBottom: 24 },
  footerLink: { color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", fontWeight: 500 },
  footerCopy: { color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", margin: 0 },
};
