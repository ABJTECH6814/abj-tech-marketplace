"use client";

/**
 * AutomationSettings — Mokolo Market
 * Dashboard vendeur > Paramètres
 * Emplacement : src/components/dashboard/AutomationSettings.tsx
 *
 * Modules :
 *   1. Pixels tracking (Facebook & TikTok) — par boutique
 *   2. Automatisation emails — jusqu'à 3 employés
 *   3. Nom de domaine personnalisé
 *   4. Liens produits — génération + copie
 */

import React, { useState } from "react";

/* ── Types ── */
interface PixelSettings {
  facebookPixelId: string;
  tiktokPixelId: string;
}

interface EmailEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  notifyOrders: boolean;
  notifyMessages: boolean;
  notifyWithdrawals: boolean;
}

interface DomainSettings {
  customDomain: string;
  status: "unconfigured" | "pending" | "active" | "error";
}

interface Product {
  id: string;
  title: string;
  slug: string;
  status: "ACTIVE" | "DRAFT" | "PAUSED";
}

/* ── Données mock — à remplacer par Firestore ── */
const MOCK_PRODUCTS: Product[] = [
  { id: "p1", title: "iPhone 15 Pro Max 256GB", slug: "iphone-15-pro-max-256gb", status: "ACTIVE" },
  { id: "p2", title: "Robe Ankara Wax Premium", slug: "robe-ankara-wax-premium", status: "ACTIVE" },
  { id: "p3", title: "Huile de Palme Bio 5L", slug: "huile-de-palme-bio-5l", status: "DRAFT" },
];

const SHOP_SLUG = "ma-boutique"; // À injecter via props/context en production
const BASE_URL = "https://mokolo.market";

/* ══════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════ */
export default function AutomationSettings() {
  const [activeTab, setActiveTab] = useState<"pixels" | "emails" | "domain" | "links">("pixels");
  const [saved, setSaved] = useState<string | null>(null);

  const showSaved = (label: string) => {
    setSaved(label);
    setTimeout(() => setSaved(null), 2500);
  };

  return (
    <div style={styles.page}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Paramètres avancés</h1>
          <p style={styles.subtitle}>Tracking, notifications, domaine et liens produits</p>
        </div>
        {saved && (
          <div style={styles.savedBadge}>
            <span style={{ marginRight: 6 }}>✓</span> {saved} sauvegardé
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {([
          { key: "pixels",  icon: "📡", label: "Pixels"   },
          { key: "emails",  icon: "📧", label: "Équipe"   },
          { key: "domain",  icon: "🌐", label: "Domaine"  },
          { key: "links",   icon: "🔗", label: "Liens"    },
        ] as { key: typeof activeTab; icon: string; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              ...styles.tab,
              ...(activeTab === t.key ? styles.tabActive : {}),
            }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={styles.content}>
        {activeTab === "pixels"  && <PixelsTab  onSave={() => showSaved("Pixels")} />}
        {activeTab === "emails"  && <EmailsTab  onSave={() => showSaved("Équipe")} />}
        {activeTab === "domain"  && <DomainTab  onSave={() => showSaved("Domaine")} />}
        {activeTab === "links"   && <LinksTab   products={MOCK_PRODUCTS} shopSlug={SHOP_SLUG} baseUrl={BASE_URL} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ONGLET 1 — PIXELS FACEBOOK & TIKTOK
══════════════════════════════════════════════ */
function PixelsTab({ onSave }: { onSave: () => void }) {
  const [pixels, setPixels] = useState<PixelSettings>({
    facebookPixelId: "",
    tiktokPixelId: "",
  });

  return (
    <div style={styles.panel}>
      <SectionTitle
        icon="📡"
        title="Pixels de suivi"
        desc="Mesurez les conversions de votre boutique. Chaque pixel ne se charge que sur vos pages."
      />

      <div style={styles.grid2}>
        {/* Facebook */}
        <PixelCard
          logo="f"
          name="Facebook / Meta Pixel"
          color="#1877F2"
          placeholder="ex: 1234567890123456"
          hint="Trouvez votre Pixel ID dans Meta Business Suite → Événements → Pixels"
          value={pixels.facebookPixelId}
          onChange={(v) => setPixels((p) => ({ ...p, facebookPixelId: v }))}
        />

        {/* TikTok */}
        <PixelCard
          logo="T"
          name="TikTok Pixel"
          color="#000000"
          placeholder="ex: CXXXXXXXXXXXXXX"
          hint="Trouvez votre Pixel ID dans TikTok Ads Manager → Actifs → Événements"
          value={pixels.tiktokPixelId}
          onChange={(v) => setPixels((p) => ({ ...p, tiktokPixelId: v }))}
        />
      </div>

      {/* Aperçu du code injecté */}
      {(pixels.facebookPixelId || pixels.tiktokPixelId) && (
        <div style={styles.codePreview}>
          <p style={styles.codeLabel}>Aperçu — code injecté sur votre boutique</p>
          <pre style={styles.codeBlock}>
            {pixels.facebookPixelId
              ? `<!-- Meta Pixel -->\n!function(f,b,e,v,n,t,s){...}();\nfbq('init', '${pixels.facebookPixelId}');\nfbq('track', 'PageView');\n\n`
              : ""}
            {pixels.tiktokPixelId
              ? `<!-- TikTok Pixel -->\n!function(w,d,t){...}();\nttq.load('${pixels.tiktokPixelId}');\nttq.page();`
              : ""}
          </pre>
        </div>
      )}

      <SaveButton onClick={onSave} />
    </div>
  );
}

function PixelCard({
  logo, name, color, placeholder, hint, value, onChange,
}: {
  logo: string; name: string; color: string; placeholder: string;
  hint: string; value: string; onChange: (v: string) => void;
}) {
  const active = value.trim().length > 0;
  return (
    <div style={{ ...styles.pixelCard, borderColor: active ? color : "#E5E5E5" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ ...styles.pixelLogo, background: color }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.9rem" }}>{logo}</span>
        </div>
        <div>
          <p style={styles.pixelName}>{name}</p>
          <p style={styles.pixelStatus}>
            {active
              ? <span style={{ color: "#16a34a" }}>● Configuré</span>
              : <span style={{ color: "#9CA3AF" }}>○ Non configuré</span>}
          </p>
        </div>
      </div>
      <label style={styles.fieldLabel}>Pixel ID</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...styles.input, borderColor: active ? color + "55" : "#E5E5E5" }}
      />
      <p style={styles.hint}>{hint}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ONGLET 2 — AUTOMATISATION EMAILS ÉQUIPE
══════════════════════════════════════════════ */
function EmailsTab({ onSave }: { onSave: () => void }) {
  const [employees, setEmployees] = useState<EmailEmployee[]>([
    { id: "e1", name: "", email: "", role: "", notifyOrders: true, notifyMessages: false, notifyWithdrawals: false },
  ]);

  const addEmployee = () => {
    if (employees.length >= 3) return;
    setEmployees((prev) => [
      ...prev,
      { id: `e${Date.now()}`, name: "", email: "", role: "", notifyOrders: true, notifyMessages: false, notifyWithdrawals: false },
    ]);
  };

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEmployee = (id: string, field: keyof EmailEmployee, value: string | boolean) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div style={styles.panel}>
      <SectionTitle
        icon="📧"
        title="Notifications équipe"
        desc="Ajoutez jusqu'à 3 collaborateurs qui reçoivent automatiquement les alertes de votre boutique."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {employees.map((emp, idx) => (
          <div key={emp.id} style={styles.employeeCard}>
            <div style={styles.employeeHeader}>
              <span style={styles.employeeBadge}>Employé {idx + 1}</span>
              {employees.length > 1 && (
                <button onClick={() => removeEmployee(emp.id)} style={styles.removeBtn}>
                  Retirer
                </button>
              )}
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.fieldLabel}>Nom complet</label>
                <input
                  type="text"
                  value={emp.name}
                  onChange={(e) => updateEmployee(emp.id, "name", e.target.value)}
                  placeholder="ex: Marie Nguele"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Poste / Rôle</label>
                <input
                  type="text"
                  value={emp.role}
                  onChange={(e) => updateEmployee(emp.id, "role", e.target.value)}
                  placeholder="ex: Responsable commandes"
                  style={styles.input}
                />
              </div>
            </div>

            <div>
              <label style={styles.fieldLabel}>Adresse email</label>
              <input
                type="email"
                value={emp.email}
                onChange={(e) => updateEmployee(emp.id, "email", e.target.value)}
                placeholder="ex: marie@monentreprise.cm"
                style={styles.input}
              />
            </div>

            <div style={styles.notifRow}>
              <p style={{ ...styles.fieldLabel, marginBottom: 10 }}>Notifications activées</p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
                {([
                  { key: "notifyOrders",      label: "🛒 Nouvelles commandes" },
                  { key: "notifyMessages",    label: "💬 Messages clients"    },
                  { key: "notifyWithdrawals", label: "💰 Retraits validés"    },
                ] as { key: keyof EmailEmployee; label: string }[]).map((n) => (
                  <label key={n.key} style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={emp[n.key] as boolean}
                      onChange={(e) => updateEmployee(emp.id, n.key, e.target.checked)}
                      style={{ accentColor: "#D72638", marginRight: 6 }}
                    />
                    {n.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {employees.length < 3 && (
        <button onClick={addEmployee} style={styles.addBtn}>
          + Ajouter un employé ({employees.length}/3)
        </button>
      )}

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   ONGLET 3 — DOMAINE PERSONNALISÉ
══════════════════════════════════════════════ */
function DomainTab({ onSave }: { onSave: () => void }) {
  const [domain, setDomain] = useState<DomainSettings>({
    customDomain: "",
    status: "unconfigured",
  });

  const statusMap = {
    unconfigured: { label: "Non configuré",  color: "#9CA3AF", icon: "○" },
    pending:      { label: "En vérification", color: "#F59E0B", icon: "◔" },
    active:       { label: "Actif",           color: "#16a34a", icon: "●" },
    error:        { label: "Erreur DNS",       color: "#D72638", icon: "✕" },
  };

  const st = statusMap[domain.status];

  return (
    <div style={styles.panel}>
      <SectionTitle
        icon="🌐"
        title="Domaine personnalisé"
        desc="Connectez votre propre domaine (ex: shop.monentreprise.cm) à votre boutique Mokolo."
      />

      <div style={styles.domainBox}>
        <label style={styles.fieldLabel}>Votre domaine</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            value={domain.customDomain}
            onChange={(e) => setDomain((d) => ({ ...d, customDomain: e.target.value }))}
            placeholder="ex: shop.monentreprise.cm"
            style={{ ...styles.input, flex: 1 }}
          />
          <span style={{ ...styles.statusPill, background: st.color + "18", color: st.color, border: `1px solid ${st.color}40` }}>
            {st.icon} {st.label}
          </span>
        </div>

        {/* Instructions DNS */}
        <div style={styles.dnsBox}>
          <p style={styles.dnsTitle}>📋 Configuration DNS requise</p>
          <p style={styles.dnsDesc}>
            Ajoutez ce record CNAME chez votre registrar (Camtel, YoomeeNet, Afrinic…) :
          </p>
          <table style={styles.dnsTable}>
            <thead>
              <tr>
                {["Type", "Nom", "Valeur", "TTL"].map((h) => (
                  <th key={h} style={styles.dnsTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.dnsTd}><code>CNAME</code></td>
                <td style={styles.dnsTd}><code>{domain.customDomain || "votre-domaine"}</code></td>
                <td style={styles.dnsTd}><code>cname.mokolo.market</code></td>
                <td style={styles.dnsTd}><code>3600</code></td>
              </tr>
            </tbody>
          </table>
          <p style={{ ...styles.hint, marginTop: 8 }}>
            La propagation DNS peut prendre jusqu'à 48h. Mokolo vérifie automatiquement toutes les heures.
          </p>
        </div>
      </div>

      {/* URL boutique actuelle */}
      <div style={styles.currentUrl}>
        <p style={styles.fieldLabel}>URL boutique actuelle</p>
        <div style={styles.urlPill}>
          <span style={{ color: "#9CA3AF" }}>mokolo.market/boutique/</span>
          <span style={{ color: "#D72638", fontWeight: 700 }}>{SHOP_SLUG}</span>
        </div>
        {domain.customDomain && (
          <>
            <p style={{ ...styles.fieldLabel, marginTop: 12 }}>URL après connexion du domaine</p>
            <div style={styles.urlPill}>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>{domain.customDomain}</span>
            </div>
          </>
        )}
      </div>

      <SaveButton onClick={onSave} />
    </div>
  );
}

const SHOP_SLUG = "ma-boutique";

/* ══════════════════════════════════════════════
   ONGLET 4 — LIENS PRODUITS
══════════════════════════════════════════════ */
function LinksTab({
  products, shopSlug, baseUrl,
}: {
  products: Product[]; shopSlug: string; baseUrl: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const getProductUrl = (slug: string) =>
    `${baseUrl}/boutique/${shopSlug}/produit/${slug}`;

  const statusStyle: Record<Product["status"], { bg: string; color: string; label: string }> = {
    ACTIVE:  { bg: "#DCFCE7", color: "#16a34a", label: "Actif"   },
    DRAFT:   { bg: "#F3F4F6", color: "#6B7280", label: "Brouillon" },
    PAUSED:  { bg: "#FEF3C7", color: "#D97706", label: "Pausé"   },
  };

  return (
    <div style={styles.panel}>
      <SectionTitle
        icon="🔗"
        title="Liens produits"
        desc="Copiez le lien unique de chaque produit pour le partager sur WhatsApp, Facebook, TikTok ou votre site."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((product) => {
          const url = getProductUrl(product.slug);
          const st = statusStyle[product.status];
          const isCopied = copied === product.id;

          return (
            <div key={product.id} style={styles.linkRow}>
              <div style={styles.linkInfo}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...styles.statusDot, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  <span style={styles.productTitle}>{product.title}</span>
                </div>
                <span style={styles.productUrl}>{url}</span>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {/* Partage WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(product.title + " — " + url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.shareBtn}
                  title="Partager sur WhatsApp"
                >
                  📱
                </a>
                {/* Copier */}
                <button
                  onClick={() => copyLink(url, product.id)}
                  style={{
                    ...styles.copyBtn,
                    background: isCopied ? "#DCFCE7" : "#F9F9F9",
                    color: isCopied ? "#16a34a" : "#0F0F0F",
                    borderColor: isCopied ? "#16a34a" : "#E5E5E5",
                  }}
                >
                  {isCopied ? "✓ Copié" : "Copier"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lien boutique entière */}
      <div style={styles.shopLinkBox}>
        <p style={styles.fieldLabel}>Lien de votre boutique complète</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ ...styles.urlPill, flex: 1 }}>
            <span style={{ color: "#D72638", fontWeight: 600 }}>
              {baseUrl}/boutique/{shopSlug}
            </span>
          </div>
          <button
            onClick={() => copyLink(`${baseUrl}/boutique/${shopSlug}`, "shop")}
            style={{
              ...styles.copyBtn,
              background: copied === "shop" ? "#DCFCE7" : "#F9F9F9",
              color: copied === "shop" ? "#16a34a" : "#0F0F0F",
              borderColor: copied === "shop" ? "#16a34a" : "#E5E5E5",
            }}
          >
            {copied === "shop" ? "✓ Copié" : "Copier"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SOUS-COMPOSANTS UTILITAIRES
══════════════════════════════════════════════ */
function SectionTitle({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={styles.sectionTitle}><span style={{ marginRight: 8 }}>{icon}</span>{title}</h2>
      <p style={styles.sectionDesc}>{desc}</p>
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
      <button onClick={onClick} style={styles.saveBtn}>
        Sauvegarder les modifications
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-body, 'Inter', sans-serif)",
    maxWidth: 900,
    margin: "0 auto",
    padding: "clamp(16px, 4vw, 32px)",
    color: "#0F0F0F",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  title: {
    fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
    fontSize: "clamp(1.3rem, 4vw, 1.75rem)",
    fontWeight: 900,
    margin: 0,
    color: "#0F0F0F",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#666",
    margin: "4px 0 0",
  },
  savedBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#DCFCE7",
    color: "#16a34a",
    border: "1px solid #86EFAC",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: "0.8rem",
    fontWeight: 600,
    animation: "fadeIn 0.2s ease",
  },
  tabBar: {
    display: "flex",
    gap: 4,
    borderBottom: "2px solid #E5E5E5",
    marginBottom: 28,
    overflowX: "auto" as const,
  },
  tab: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    padding: "10px 18px",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#666",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition: "color 0.15s, border-color 0.15s",
  },
  tabActive: {
    color: "#D72638",
    borderBottomColor: "#D72638",
  },
  content: {},
  panel: {
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    borderRadius: 16,
    padding: "clamp(20px, 4vw, 32px)",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 800,
    margin: "0 0 6px",
    fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
  },
  sectionDesc: {
    fontSize: "0.85rem",
    color: "#666",
    margin: 0,
    lineHeight: 1.5,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  pixelCard: {
    border: "1.5px solid #E5E5E5",
    borderRadius: 12,
    padding: 20,
    transition: "border-color 0.2s",
  },
  pixelLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pixelName: {
    fontSize: "0.875rem",
    fontWeight: 700,
    margin: 0,
  },
  pixelStatus: {
    fontSize: "0.75rem",
    margin: "2px 0 0",
  },
  fieldLabel: {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#444",
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "9px 12px",
    fontSize: "0.875rem",
    border: "1.5px solid #E5E5E5",
    borderRadius: 8,
    outline: "none",
    fontFamily: "monospace",
    background: "#FAFAFA",
    transition: "border-color 0.15s",
  },
  hint: {
    fontSize: "0.72rem",
    color: "#9CA3AF",
    marginTop: 6,
    lineHeight: 1.4,
  },
  codePreview: {
    marginTop: 20,
    background: "#0F0F0F",
    borderRadius: 12,
    overflow: "hidden",
  },
  codeLabel: {
    fontSize: "0.72rem",
    color: "#666",
    background: "#1A1A1A",
    padding: "8px 16px",
    margin: 0,
    letterSpacing: "0.05em",
  },
  codeBlock: {
    padding: "14px 16px",
    fontSize: "0.75rem",
    color: "#86EFAC",
    margin: 0,
    overflowX: "auto" as const,
    lineHeight: 1.6,
  },
  employeeCard: {
    border: "1.5px solid #E5E5E5",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  employeeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  employeeBadge: {
    background: "#FFF0F2",
    color: "#D72638",
    border: "1px solid #D7263820",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  removeBtn: {
    background: "none",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: "0.75rem",
    color: "#9CA3AF",
    cursor: "pointer",
  },
  notifRow: {
    background: "#F9F9F9",
    borderRadius: 8,
    padding: 14,
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.825rem",
    color: "#444",
    cursor: "pointer",
    padding: "6px 12px",
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 8,
    userSelect: "none" as const,
  },
  addBtn: {
    marginTop: 16,
    width: "100%",
    padding: "10px",
    background: "#FFF0F2",
    color: "#D72638",
    border: "1.5px dashed #D7263860",
    borderRadius: 10,
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  domainBox: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  statusPill: {
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: "0.75rem",
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
  },
  dnsBox: {
    background: "#F9F9F9",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  dnsTitle: {
    fontSize: "0.825rem",
    fontWeight: 700,
    margin: "0 0 6px",
  },
  dnsDesc: {
    fontSize: "0.8rem",
    color: "#666",
    margin: "0 0 12px",
  },
  dnsTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.8rem",
  },
  dnsTh: {
    textAlign: "left" as const,
    padding: "6px 10px",
    background: "#F3F4F6",
    fontWeight: 700,
    fontSize: "0.72rem",
    color: "#666",
    borderRadius: 4,
  },
  dnsTd: {
    padding: "8px 10px",
    borderBottom: "1px solid #E5E5E5",
    fontFamily: "monospace",
    fontSize: "0.8rem",
  },
  currentUrl: {
    marginTop: 20,
    padding: 16,
    background: "#F9F9F9",
    borderRadius: 10,
    border: "1px solid #E5E5E5",
  },
  urlPill: {
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontFamily: "monospace",
  },
  linkRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    background: "#FAFAFA",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    flexWrap: "wrap" as const,
  },
  linkInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  statusDot: {
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: "0.7rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  productTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  productUrl: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  shareBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    background: "#DCFCE7",
    border: "1px solid #86EFAC",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: "1rem",
    cursor: "pointer",
  },
  copyBtn: {
    padding: "7px 14px",
    border: "1.5px solid #E5E5E5",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  },
  shopLinkBox: {
    marginTop: 20,
    padding: 16,
    background: "#FFF0F2",
    border: "1px solid #D7263820",
    borderRadius: 10,
  },
  saveBtn: {
    background: "#D72638",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 24px",
    fontSize: "0.875rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(215,38,56,0.25)",
    transition: "background 0.15s",
  },
};
