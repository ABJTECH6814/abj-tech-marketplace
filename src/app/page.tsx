"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  collection, onSnapshot, query, where,
  orderBy, limit, getCountFromServer,
  doc, setDoc, serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";
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

const CATEGORIES = [
  { label: "Téléphones & Électronique", icon: "📱" },
  { label: "Mode & Vêtements",          icon: "👕" },
  { label: "Maison & Décoration",       icon: "🏠" },
  { label: "Alimentation & Agro",       icon: "🌾" },
  { label: "Beauté & Santé",            icon: "💄" },
  { label: "Services B2B",              icon: "🏢" },
];

/* ─────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("opacity-100", "translate-y-0");
      }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".mm-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────
   ALERT
───────────────────────────────────────── */
function Alert({ type, message, onClose }: {
  type: "success" | "error" | "info" | "warning"; message: string; onClose: () => void;
}) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: "bg-green-50 border-green-300 text-green-700",
    error:   "bg-mokolo-red-light border-mokolo-red/30 text-mokolo-red-dark",
    info:    "bg-blue-50 border-blue-300 text-blue-700",
    warning: "bg-amber-50 border-amber-300 text-amber-700",
  }[type];
  const icon = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" }[type];
  const dotBg = {
    success: "bg-green-600", error: "bg-mokolo-red-dark",
    info: "bg-blue-600", warning: "bg-amber-600",
  }[type];

  return (
    <div className={`fixed top-[70px] left-3 right-3 z-[9000] ${styles} border-[1.5px] rounded-xl px-3.5 py-3 flex items-center gap-2.5 shadow-lg animate-[mmSlideDown_0.35s_cubic-bezier(0.34,1.4,0.64,1)_both] max-w-md mx-auto`}>
      <div className={`w-7 h-7 rounded-full ${dotBg} text-white flex items-center justify-center text-sm font-black shrink-0`}>{icon}</div>
      <p className="flex-1 text-[0.82rem] font-semibold leading-snug">{message}</p>
      <button onClick={onClose} className="text-lg opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────── */
function AuthModal({ open, onClose, mode = "register", reason, onSuccess }: {
  open: boolean; onClose: () => void; mode?: "register" | "login"; reason?: string; onSuccess: (msg: string) => void;
}) {
  const [tab, setTab]         = useState<"login" | "register">(mode);
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "", type: "BUYER" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setTab(mode); }, [open, mode]);
  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      if (tab === "register") {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid, email: form.email,
          firstName: form.name.split(" ")[0] || form.name,
          lastName: form.name.split(" ").slice(1).join(" ") || "",
          phone: form.phone, role: form.type,
          avatar: "", city: "", language: "fr",
          isVerified: false, kycStatus: "PENDING",
          createdAt: serverTimestamp(), lastLogin: serverTimestamp(),
        });
        if (form.type === "SELLER") {
          const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
          await setDoc(doc(db, "sellerProfiles", cred.user.uid), {
            userId: cred.user.uid, shopName: form.name, shopSlug: slug,
            type: "B2C", subscriptionPlan: "FREE", totalSales: 0,
            totalRevenue: 0, rating: 0, badge: "NONE",
            createdAt: serverTimestamp(),
          });
        }
        onClose();
        onSuccess("Compte créé ! Bienvenue sur Mokolo Market 🎉");
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        onClose();
        onSuccess("Connexion réussie ! Bon retour 👋");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") onSuccess("❌ Email déjà utilisé. Connectez-vous.");
      else if (code === "auth/wrong-password" || code === "auth/invalid-credential") onSuccess("❌ Email ou mot de passe incorrect.");
      else if (code === "auth/weak-password") onSuccess("❌ Mot de passe trop faible (min. 6 caractères).");
      else onSuccess("❌ Erreur. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid, email: cred.user.email ?? "",
        firstName: cred.user.displayName?.split(" ")[0] ?? "",
        lastName: cred.user.displayName?.split(" ").slice(1).join(" ") ?? "",
        avatar: cred.user.photoURL ?? "", role: "BUYER",
        city: "", language: "fr", isVerified: true, kycStatus: "PENDING",
        createdAt: serverTimestamp(), lastLogin: serverTimestamp(),
      }, { merge: true });
      onClose();
      onSuccess(`Bienvenue ${cred.user.displayName ?? ""} ! 🎉`);
    } catch {
      onSuccess("❌ Connexion Google échouée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[8000] bg-black/55 backdrop-blur-sm flex items-end sm:items-center sm:justify-center animate-[mmFadeIn_0.25s_ease_both]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-[20px] sm:rounded-2xl p-6 pb-9 sm:pb-6 max-h-[90vh] overflow-y-auto animate-[mmSlideUp_0.38s_cubic-bezier(0.34,1.15,0.64,1)_both]"
      >
        <div className="w-10 h-1 bg-mokolo-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        {reason && (
          <div className="bg-mokolo-red-light border border-mokolo-red/30 rounded-lg px-3.5 py-2.5 mb-4 text-[0.8rem] text-mokolo-red-dark font-semibold">
            🔒 {reason}
          </div>
        )}

        <div className="flex bg-mokolo-gray-100 rounded-lg p-1 mb-5">
          {(["register", "login"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-md text-[0.82rem] font-bold transition-all ${
                tab === t ? "bg-white text-mokolo-black shadow-sm" : "text-mokolo-gray-600"
              }`}
            >
              {t === "register" ? "S'inscrire" : "Se connecter"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {tab === "register" && (
            <>
              <MMInput label="Nom complet" placeholder="Jean Mbarga" type="text" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <div>
                <label className="text-[0.72rem] font-bold text-mokolo-gray-600 uppercase tracking-wide">Type de compte</label>
                <div className="flex gap-2 mt-1.5">
                  {(["BUYER", "SELLER"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 py-2.5 rounded-lg text-[0.82rem] font-bold border-[1.5px] transition-all ${
                        form.type === t
                          ? "border-mokolo-red bg-mokolo-red-light text-mokolo-red"
                          : "border-mokolo-gray-200 bg-white text-mokolo-gray-600"
                      }`}
                    >
                      {t === "BUYER" ? "🛒 Acheteur" : "🏪 Vendeur"}
                    </button>
                  ))}
                </div>
              </div>
              <MMInput label="Téléphone" placeholder="+237 6XX XXX XXX" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            </>
          )}
          <MMInput label="Email" placeholder="jean@email.cm" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          <MMInput label="Mot de passe" placeholder="••••••••" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mm-btn-red mm-ripple w-full py-3.5 rounded-xl text-[0.9rem] font-bold text-white mt-1 disabled:opacity-60"
          >
            {loading ? "⏳ Traitement…" : tab === "register" ? "Créer mon compte" : "Se connecter"}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-px bg-mokolo-gray-200" />
            <span className="text-[0.72rem] text-mokolo-gray-600">ou</span>
            <div className="flex-1 h-px bg-mokolo-gray-200" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl text-[0.85rem] font-semibold border-[1.5px] border-mokolo-gray-200 bg-white text-mokolo-black hover:border-mokolo-red hover:bg-mokolo-red-light transition-all disabled:opacity-60"
          >
            🔵 Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
}

function MMInput({ label, placeholder, type, value, onChange }: {
  label: string; placeholder: string; type: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[0.72rem] font-bold text-mokolo-gray-600 uppercase tracking-wide">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg border-[1.5px] border-mokolo-gray-200 bg-mokolo-gray-50 text-[0.875rem] text-mokolo-black focus:border-mokolo-red focus:ring-2 focus:ring-mokolo-red/15 outline-none transition-all"
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   CHAT MODAL
───────────────────────────────────────── */
function ChatModal({ open, onClose, product, priceType, isAuth, onAuthRequired }: {
  open: boolean; onClose: () => void; product: Product | null;
  priceType: "normal" | "negotiated" | "wholesale"; isAuth: boolean; onAuthRequired: (r: string) => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && product) {
      const price = product.priceTiers?.[priceType === "normal" ? 0 : priceType === "negotiated" ? 1 : 2]?.price;
      setMessages([{
        role: "ai",
        text: priceType === "negotiated"
          ? `Bonjour ! Je suis l'assistant IA de ${product.shopName ?? "cette boutique"}. Prix affiché : ${price?.toLocaleString()} FCFA. Quelle quantité vous intéresse ? 🤝`
          : `Bonjour ! Pour une commande en gros de "${product.title}" à ${price?.toLocaleString()} FCFA/unité, comment puis-je vous aider ? 📦`,
      }]);
    }
  }, [open, product, priceType]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!open || !product) return null;

  const send = async () => {
    if (!isAuth) { onClose(); onAuthRequired("Connectez-vous pour négocier avec le vendeur."); return; }
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    const reply = msg.toLowerCase().includes("prix") || msg.toLowerCase().includes("combien")
      ? `Pour cette quantité, je peux proposer ${(product.priceTiers?.[1]?.price ?? 0).toLocaleString()} FCFA/unité. Intéressé(e) ?`
      : `Merci pour votre message. Notre équipe vous recontacte sous 24h. Autre question sur "${product.title}" ?`;
    setMessages((m) => [...m, { role: "ai", text: reply }]);
    setSending(false);
  };

  const badgeStyles = {
    normal:     "bg-mokolo-red-light text-mokolo-red",
    negotiated: "bg-mokolo-gray-100 text-mokolo-black",
    wholesale:  "bg-green-50 text-green-700",
  };
  const labels = { normal: "Prix normal", negotiated: "Négociation", wholesale: "Prix de gros" };

  return (
    <div className="fixed inset-0 z-[8000] bg-black/55 backdrop-blur-sm flex items-end sm:items-center sm:justify-center animate-[mmFadeIn_0.25s_ease_both]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-white rounded-t-[20px] sm:rounded-2xl max-h-[88vh] sm:h-[600px] flex flex-col animate-[mmSlideUp_0.38s_cubic-bezier(0.34,1.15,0.64,1)_both]">
        <div className="px-4 py-3.5 border-b border-mokolo-gray-200 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-mokolo-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
            {product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" /> : "📦"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.8rem] font-bold truncate">{product.title}</p>
            <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${badgeStyles[priceType]}`}>{labels[priceType]}</span>
          </div>
          <button onClick={onClose} className="text-xl text-mokolo-gray-600">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-mokolo-red text-white flex items-center justify-center text-[0.7rem] font-black mr-2 shrink-0">IA</div>
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 text-[0.82rem] leading-relaxed ${
                m.role === "user"
                  ? "bg-mokolo-red text-white rounded-2xl rounded-br-sm"
                  : "bg-mokolo-gray-100 text-mokolo-black rounded-2xl rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-1 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-mokolo-gray-600" style={{ animation: `mmPulse 1s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 pb-6 sm:pb-3 border-t border-mokolo-gray-200 flex gap-2.5">
          <input
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Votre message…"
            className="flex-1 px-3.5 py-2.5 rounded-xl border-[1.5px] border-mokolo-gray-200 bg-mokolo-gray-50 text-[0.85rem] focus:border-mokolo-red outline-none transition-all"
          />
          <button onClick={send} className="mm-btn-red mm-ripple w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg shrink-0">→</button>
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
  const [products, setProducts]           = useState<Product[]>([]);
  const [sellers, setSellers]             = useState<SellerProfile[]>([]);
  const [sponsored, setSponsored]         = useState<SellerProfile[]>([]);
  const [banners, setBanners]             = useState<Banner[]>([]);
  const [videos, setVideos]               = useState<Video[]>([]);
  const [sellerCount, setSellerCount]     = useState<number | null>(null);
  const [productCount, setProductCount]   = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<"home" | "reels" | "market" | "messages" | "profile">("home");
  const [lang, setLang]                   = useState<"fr" | "en">("fr");
  const [authModal, setAuthModal]         = useState(false);
  const [authReason, setAuthReason]       = useState("");
  const [authMode, setAuthMode]           = useState<"register" | "login">("register");
  const [chatModal, setChatModal]         = useState(false);
  const [chatProduct, setChatProduct]     = useState<Product | null>(null);
  const [chatPriceType, setChatPriceType] = useState<"normal" | "negotiated" | "wholesale">("negotiated");
  const [alert, setAlert]                 = useState<{ type: "success" | "error" | "info" | "warning"; message: string } | null>(null);

  useScrollReveal();

  const showAlert = useCallback((type: "success" | "error" | "info" | "warning", message: string) => setAlert({ type, message }), []);
  const requireAuth = useCallback((reason: string, mode: "register" | "login" = "register") => {
    setAuthReason(reason); setAuthMode(mode); setAuthModal(true);
  }, []);
  const openChat = useCallback((product: Product, priceType: "normal" | "negotiated" | "wholesale") => {
    if (!user) { requireAuth("Connectez-vous pour négocier directement avec le vendeur."); return; }
    setChatProduct(product); setChatPriceType(priceType); setChatModal(true);
  }, [user, requireAuth]);

  useEffect(() => {
    const q = query(collection(db, "products"), where("status", "==", "ACTIVE"), orderBy("createdAt", "desc"), limit(40));
    const u = onSnapshot(q, (s) => { setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() } as Product))); setLoading(false); }, () => setLoading(false));
    return () => u();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "sellerProfiles"), orderBy("totalSales", "desc"), limit(10));
    const u = onSnapshot(q, (s) => setSellers(s.docs.map((d) => ({ id: d.id, ...d.data() } as SellerProfile))));
    return () => u();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "sellerProfiles"), where("subscriptionPlan", "!=", "FREE"), limit(6));
    const u = onSnapshot(q, (s) => setSponsored(s.docs.map((d) => ({ id: d.id, ...d.data() } as SellerProfile))));
    return () => u();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "banners"), where("active", "==", true), orderBy("priority", "asc"), limit(8));
    const u = onSnapshot(q, (s) => setBanners(s.docs.map((d) => ({ id: d.id, ...d.data() } as Banner))));
    return () => u();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "videos"), where("active", "==", true), orderBy("createdAt", "desc"), limit(10));
    const u = onSnapshot(q, (s) => setVideos(s.docs.map((d) => ({ id: d.id, ...d.data() } as Video))));
    return () => u();
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
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const isEmpty = !loading && products.length === 0 && sellers.length === 0;

  return (
    <>
      <style>{`
        @keyframes mmSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes mmPulse { 0%,100%{opacity:.4} 50%{opacity:.85} }
        @keyframes mmSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes mmSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mmFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mmShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes mmRipple { 0%{transform:scale(0) translate(-50%,-50%);opacity:0.6} 100%{transform:scale(4) translate(-50%,-50%);opacity:0} }
        @keyframes mmFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes mmBounce { 0%,100%{transform:scale(1.15) translateY(0)} 40%{transform:scale(1.15) translateY(-6px)} 60%{transform:scale(1.15) translateY(-3px)} }

        html, body { overflow-x: hidden; }

        .mm-hscroll::-webkit-scrollbar { display: none; }
        .mm-hscroll { -ms-overflow-style: none; scrollbar-width: none; }

        .mm-btn-red { position: relative; overflow: hidden; background: #D72638; transition: background .2s, transform .15s, box-shadow .2s; box-shadow: 0 4px 14px rgba(215,38,56,.30); }
        .mm-btn-red:hover { background: #A51C2B; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(215,38,56,.40); }
        .mm-btn-red:active { transform: scale(.96); }
        .mm-btn-red::before { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent); transition:left .4s ease; }
        .mm-btn-red:hover::before { left: 150%; }

        .mm-btn-black { position: relative; overflow: hidden; background: #0F0F0F; transition: background .2s, transform .15s, box-shadow .2s; box-shadow: 0 4px 14px rgba(0,0,0,.20); }
        .mm-btn-black:hover { background: #1A1A1A; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.30); }
        .mm-btn-black:active { transform: scale(.96); }

        .mm-btn-green { position: relative; overflow: hidden; background: #16a34a; transition: background .2s, transform .15s, box-shadow .2s; box-shadow: 0 4px 14px rgba(22,163,74,.25); }
        .mm-btn-green:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(22,163,74,.35); }
        .mm-btn-green:active { transform: scale(.96); }

        .mm-ripple::after { content:''; position:absolute; top:50%; left:50%; width:10px; height:10px; background:rgba(255,255,255,.35); border-radius:50%; transform:scale(0) translate(-50%,-50%); transform-origin: top left; }
        .mm-ripple:active::after { animation: mmRipple .5s ease-out; }

        .mm-card { transition: transform .25s cubic-bezier(.34,1.2,.64,1), box-shadow .25s ease; }
        .mm-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
        .mm-card-img img { transition: transform .4s ease; }
        .mm-card:hover .mm-card-img img { transform: scale(1.07); }

        .mm-banner { transition: transform .3s ease, box-shadow .3s ease; }
        .mm-banner:hover { transform: scale(1.02); box-shadow: 0 10px 30px rgba(0,0,0,.18); }

        .mm-shop-card { transition: transform .25s cubic-bezier(.34,1.2,.64,1), box-shadow .25s ease, border-color .2s; }
        .mm-shop-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.10); border-color: #D72638; }

        .mm-chip { transition: all .2s cubic-bezier(.34,1.2,.64,1); }
        .mm-chip:hover { transform: translateY(-2px); }
        .mm-chip:active { transform: scale(.94); }

        .mm-skeleton { background: linear-gradient(90deg,#F3F4F6 25%,#E5E5E5 50%,#F3F4F6 75%); background-size: 200% 100%; animation: mmShimmer 1.5s infinite; }

        .mm-infinite-track { animation: mmSlide 40s linear infinite; }
        .mm-infinite-track:hover { animation-play-state: paused; }

        .mm-nitem.active .mm-nicon { animation: mmBounce .5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <AuthModal open={authModal} mode={authMode} reason={authReason} onClose={() => setAuthModal(false)} onSuccess={(msg) => showAlert("success", msg)} />
      <ChatModal open={chatModal} product={chatProduct} priceType={chatPriceType} isAuth={!!user} onClose={() => setChatModal(false)} onAuthRequired={(reason) => { setChatModal(false); requireAuth(reason); }} />

      <div className="min-h-screen bg-mokolo-gray-50 pb-[70px] lg:pb-0 overflow-x-hidden">

        {/* ══ HEADER ══ */}
        <header className="sticky top-0 z-[100] bg-white border-b border-mokolo-gray-200 shadow-sm">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 pt-2.5 pb-1.5">
            <Link href="/" className="leading-none transition-transform hover:scale-[1.03]">
              <div className="font-heading font-black text-[1.15rem] leading-none">
                MOKOLO <span className="text-mokolo-red">MARKET</span>
              </div>
              <div className="text-[0.62rem] text-mokolo-gray-600 mt-0.5">
                {lang === "fr" ? "Votre marketplace africaine" : "Your African marketplace"}
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="mm-chip bg-mokolo-gray-100 rounded-md px-2 py-1 text-[0.68rem] font-bold">
                {lang.toUpperCase()}
              </button>
              <button className="p-1.5 rounded-full hover:bg-mokolo-red-light transition-all hover:scale-110">
                <span className="text-xl">🔔</span>
              </button>
              <button onClick={() => !user && requireAuth("Connectez-vous pour accéder à vos messages.")} className="p-1.5 rounded-full hover:bg-mokolo-red-light transition-all hover:scale-110">
                <span className="text-xl">💬</span>
              </button>
              <button onClick={() => !user && requireAuth("Connectez-vous pour accéder à votre panier.")} className="p-1.5 rounded-full hover:bg-mokolo-red-light transition-all hover:scale-110">
                <span className="text-xl">🛒</span>
              </button>
              {!user && (
                <button onClick={() => requireAuth("Créez votre compte pour profiter de toutes les fonctionnalités.")} className="mm-btn-red mm-ripple text-white rounded-lg px-3 py-1.5 text-[0.72rem] font-bold">
                  {lang === "fr" ? "S'inscrire" : "Sign up"}
                </button>
              )}
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 pb-2.5">
            <div className="flex items-center bg-mokolo-gray-100 border border-mokolo-gray-200 rounded-xl px-3.5 h-10 focus-within:border-mokolo-red focus-within:ring-2 focus-within:ring-mokolo-red/15 transition-all max-w-2xl">
              <span className="text-base mr-2 opacity-50">🔍</span>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher un produit, vendeur…" : "Search product, seller…"}
                className="flex-1 bg-transparent text-[0.82rem] outline-none"
              />
              {search ? (
                <button onClick={() => setSearch("")} className="text-base text-mokolo-gray-600">×</button>
              ) : (
                <div className="w-px h-4.5 bg-mokolo-gray-200 mx-2" />
              )}
              <button className="text-sm">⚙️</button>
            </div>
          </div>
        </header>

        {/* ══ PAGE VIDE ══ */}
        {isEmpty && (
          <div className="px-5 py-14 text-center animate-[mmFadeIn_0.5s_ease_both]">
            <div className="text-6xl mb-4" style={{ animation: "mmFloat 3s ease-in-out infinite" }}>🛍️</div>
            <h2 className="font-heading text-xl font-black mb-2.5">
              {lang === "fr" ? "Bienvenue sur Mokolo Market" : "Welcome to Mokolo Market"}
            </h2>
            <p className="text-mokolo-gray-600 text-[0.85rem] leading-relaxed max-w-[300px] mx-auto mb-7">
              {lang === "fr" ? "La marketplace africaine de confiance. Inscrivez-vous pour publier vos produits." : "Africa's trusted marketplace. Sign up to publish your products."}
            </p>
            <div className="flex flex-col gap-2.5 max-w-[260px] mx-auto">
              <button onClick={() => requireAuth("Créez votre compte vendeur pour publier vos premiers produits.")} className="mm-btn-red mm-ripple text-white rounded-xl py-3.5 px-6 text-[0.9rem] font-bold">
                {lang === "fr" ? "S'inscrire maintenant" : "Register now"}
              </button>
              <button onClick={() => requireAuth("Connectez-vous à votre compte.", "login")} className="bg-white text-mokolo-black border-[1.5px] border-mokolo-gray-200 rounded-xl py-3 px-6 font-semibold text-[0.9rem] hover:border-mokolo-red transition-all">
                {lang === "fr" ? "Se connecter" : "Sign in"}
              </button>
            </div>
          </div>
        )}

        {/* ══ CONTENU PRINCIPAL ══ */}
        {!isEmpty && (
          <div className="max-w-[1400px] mx-auto">

            {/* Catégories */}
            <div className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 bg-white border-b border-mokolo-gray-200 px-4 py-3">
              <div className="mm-hscroll flex gap-2 overflow-x-auto">
                {CATEGORIES.map((c) => {
                  const isActive = activeCategory === c.label;
                  return (
                    <button
                      key={c.label}
                      onClick={() => setActiveCategory(isActive ? null : c.label)}
                      className={`mm-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.75rem] font-semibold whitespace-nowrap shrink-0 border-[1.5px] ${
                        isActive ? "bg-mokolo-red border-mokolo-red text-white shadow-md" : "bg-white border-mokolo-gray-200 text-mokolo-black"
                      }`}
                    >
                      <span>{c.icon}</span><span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutiques sponsorisées */}
            {sponsored.length > 0 && (
              <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 bg-white px-4 pt-4 pb-3 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-lg bg-mokolo-black flex items-center justify-center text-sm">⭐</div>
                    <span className="font-heading font-black text-[0.95rem]">{lang === "fr" ? "Boutiques Sponsorisées" : "Sponsored Shops"}</span>
                  </div>
                  <Link href="/boutiques" className="text-[0.72rem] font-semibold text-mokolo-red">{lang === "fr" ? "Voir tout →" : "See all →"}</Link>
                </div>
                <div className="mm-hscroll flex gap-3 overflow-x-auto pb-1">
                  {sponsored.map((s) => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} className="mm-banner shrink-0 w-[270px] bg-white border border-mokolo-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="h-20 bg-gradient-to-br from-mokolo-black to-mokolo-red-dark relative">
                        <span className="absolute top-1.5 left-2 bg-mokolo-red text-white text-[0.58rem] font-extrabold px-1.5 py-0.5 rounded">→ Sponsorisé</span>
                        <span className="absolute top-1.5 right-2 bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[0.58rem] font-bold px-1.5 py-0.5 rounded">★ Recommandée</span>
                      </div>
                      <div className="px-3 pb-3 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9.5 h-9.5 rounded-[9px] bg-mokolo-red overflow-hidden shrink-0 flex items-center justify-center -mt-5.5 border-2 border-white shadow relative z-10">
                            {s.logoUrl ? <img src={s.logoUrl} alt={s.shopName} className="w-full h-full object-cover" /> : <span className="text-white font-black">{s.shopName.charAt(0)}</span>}
                          </div>
                          <div>
                            <div className="font-bold text-[0.82rem]">{s.shopName}</div>
                            {s.city && <div className="text-[0.65rem] text-mokolo-gray-600">📍 {s.city}</div>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[0.7rem] text-mokolo-gray-600">Mokolo vous encourage à acheter</span>
                          <span className="bg-mokolo-red-light text-mokolo-red text-[0.7rem] font-bold px-2.5 py-1 rounded-full">Acheter</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Bannières horizontales */}
            {banners.length > 0 && (
              <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 pt-3.5 pb-2.5 pl-4 mt-2">
                <div className="mm-hscroll flex gap-3 overflow-x-auto">
                  {banners.map((b) => (
                    <a key={b.id} href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="mm-banner shrink-0 w-[clamp(240px,70vw,320px)] h-[110px] rounded-2xl overflow-hidden relative block bg-gradient-to-br from-mokolo-black to-mokolo-red-dark">
                      {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />}
                      {!b.imageUrl && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-white font-bold text-[0.85rem]">{b.title}</span>
                          <span className="text-white/60 text-[0.7rem] mt-1">{b.shopName}</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 left-2 bg-black/55 text-white/75 text-[0.55rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded">Sponsorisé</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Carrousel infini */}
            {products.length > 0 && (
              <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 pt-4 overflow-hidden">
                <div className="flex items-center justify-between px-4 mb-3">
                  <span className="font-heading font-black text-[0.95rem]">🔥 {lang === "fr" ? "Arrivages récents" : "Recent arrivals"}</span>
                  <span className="text-[0.7rem] text-mokolo-gray-600">↔ En continu</span>
                </div>
                <div className="overflow-hidden">
                  <div className="mm-infinite-track flex gap-3 w-max">
                    {[...products, ...products].map((p, i) => (
                      <div key={`${p.id}-${i}`} className="mm-card w-[150px] shrink-0 bg-white border border-mokolo-gray-200 rounded-xl overflow-hidden">
                        <div className="mm-card-img w-full aspect-square bg-mokolo-gray-100 overflow-hidden flex items-center justify-center">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
                        </div>
                        <div className="px-2.5 py-1.5">
                          <p className="text-[0.6rem] text-mokolo-gray-600 font-bold uppercase mb-0.5">{p.category}</p>
                          <p className="text-[0.75rem] font-semibold truncate">{p.title}</p>
                          {p.priceTiers?.[0] && <p className="text-[0.78rem] font-extrabold text-mokolo-red mt-1">{p.priceTiers[0].price.toLocaleString()} <span className="text-[0.6rem]">F</span></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Reels */}
            {videos.length > 0 && (
              <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 pt-4 pl-4 mt-2">
                <div className="flex items-center justify-between pr-4 mb-3">
                  <span className="font-heading font-black text-[0.95rem]">🎬 {lang === "fr" ? "Reels & Vidéos" : "Reels & Videos"}</span>
                  <Link href="/reels" className="text-[0.72rem] font-semibold text-mokolo-red">{lang === "fr" ? "Voir tout →" : "See all →"}</Link>
                </div>
                <div className="mm-hscroll flex gap-3 overflow-x-auto">
                  {videos.map((v) => (
                    <Link key={v.id} href={`/reels/${v.id}`} className="mm-banner shrink-0 w-[120px] aspect-[9/16] rounded-xl overflow-hidden relative block bg-mokolo-black">
                      {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-7.5 h-7.5 rounded-full bg-white/25 flex items-center justify-center">▶</div>
                      {v.type === "REEL" && <span className="absolute top-1.5 left-1.5 bg-mokolo-red text-white text-[0.5rem] font-extrabold px-1.5 py-0.5 rounded">REEL</span>}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5">
                        <p className="text-[0.62rem] font-semibold text-white leading-tight line-clamp-2">{v.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Catalogue */}
            <section id="catalogue" className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 px-4 pt-4.5">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-heading font-black text-[0.95rem]">{activeCategory ?? (lang === "fr" ? "Tous les produits" : "All products")}</span>
                {activeCategory && (
                  <button onClick={() => setActiveCategory(null)} className="mm-chip bg-mokolo-red-light text-mokolo-red border border-mokolo-red/30 rounded-md px-2.5 py-1 text-[0.72rem] font-semibold">
                    Voir tout ×
                  </button>
                )}
              </div>
              {loading ? <SkeletonGrid /> : filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="text-4xl">🛍️</span>
                  <p className="mt-2.5 text-mokolo-gray-600 text-[0.85rem]">{search ? `Aucun résultat pour "${search}"` : "Aucun produit dans cette catégorie"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} onChat={openChat} onAuthRequired={requireAuth} isAuth={!!user} />
                  ))}
                </div>
              )}
            </section>

            {/* Boutiques populaires */}
            {sellers.length > 0 && (
              <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 px-4 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-[0.95rem]">🏪 {lang === "fr" ? "Boutiques Populaires" : "Popular Shops"}</span>
                    <span className="bg-mokolo-red text-white text-[0.58rem] font-extrabold px-1.5 py-0.5 rounded-full">● Statuts</span>
                  </div>
                  <Link href="/boutiques" className="text-[0.72rem] font-semibold text-mokolo-red">{lang === "fr" ? "Voir + →" : "See more →"}</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                  {sellers.slice(0, 6).map((s) => (
                    <Link key={s.id} href={`/boutique/${s.shopSlug}`} className="mm-shop-card bg-white border border-mokolo-gray-200 rounded-xl px-2.5 py-3.5 flex flex-col items-center text-center gap-1.5 shadow-sm">
                      <div className="w-12.5 h-12.5 rounded-[13px] bg-mokolo-red overflow-hidden flex items-center justify-center shadow-md">
                        {s.logoUrl ? <img src={s.logoUrl} alt={s.shopName} className="w-full h-full object-cover" /> : <span className="text-white font-black text-xl">{s.shopName.charAt(0)}</span>}
                      </div>
                      <div>
                        <div className="font-bold text-[0.78rem]">{s.shopName}</div>
                        {s.city && <div className="text-[0.62rem] text-mokolo-gray-600 mt-0.5">📍 {s.city}</div>}
                        <div className="text-[0.62rem] text-amber-500 mt-0.5">★ {s.rating?.toFixed(1) ?? "0.0"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Vendeur */}
            <section className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 mx-4 mt-5 bg-gradient-to-br from-mokolo-black to-[#1a0205] rounded-2xl px-5 py-6 border border-mokolo-red/30 hover:shadow-xl hover:shadow-mokolo-red/10 transition-shadow">
              <h2 className="font-heading font-black text-white text-[clamp(1rem,4vw,1.3rem)] mb-2">
                {lang === "fr" ? "Commencer à vendre" : "Start selling"}
              </h2>
              <p className="text-white/55 text-[0.82rem] mb-4.5 leading-relaxed">
                {lang === "fr" ? "Rejoignez des milliers de vendeurs. Paiement sécurisé, commission transparente." : "Join thousands of sellers. Secure payment, transparent commission."}
              </p>
              <button onClick={() => requireAuth("Créez votre compte vendeur pour ouvrir votre boutique.")} className="mm-btn-red mm-ripple text-white rounded-xl px-6 py-2.5 text-[0.875rem] font-bold">
                {lang === "fr" ? "Ouvrir ma boutique →" : "Open my shop →"}
              </button>
            </section>

            {/* Footer */}
            <footer className="mm-reveal opacity-0 translate-y-5 transition-all duration-500 px-4 pt-6 pb-4 mt-5">
              <p className="font-heading font-black text-base mb-1">MOKOLO <span className="text-mokolo-red">MARKET</span></p>
              <p className="text-mokolo-gray-600 text-[0.7rem] mb-3.5">{lang === "fr" ? "La marketplace africaine de confiance" : "Africa's trusted marketplace"}</p>
              <div className="flex flex-wrap gap-3.5 mb-3.5">
                {[
                  { href: "/auth", label: lang === "fr" ? "Connexion" : "Sign in" },
                  { href: "/auth?mode=seller", label: lang === "fr" ? "Devenir vendeur" : "Become seller" },
                  { href: "/aide", label: lang === "fr" ? "Aide" : "Help" },
                  { href: "/contact", label: "Contact" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-mokolo-gray-600 text-[0.75rem] font-medium hover:text-mokolo-red transition-colors">{l.label}</Link>
                ))}
              </div>
              <p className="text-mokolo-gray-200 text-[0.65rem]">© {new Date().getFullYear()} MOKOLO Market — ABJ Tech Agency · Yaoundé</p>
            </footer>
          </div>
        )}
      </div>

      {/* Bottom Nav — mobile uniquement */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[500] bg-white border-t border-mokolo-gray-200 flex h-[62px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {([
          { key: "home", icon: "🏠", fr: "Accueil", en: "Home" },
          { key: "reels", icon: "🎬", fr: "Reels", en: "Reels" },
          { key: "market", icon: "🏪", fr: "Market", en: "Market" },
          { key: "messages", icon: "💬", fr: "Messages", en: "Messages" },
          { key: "profile", icon: "👤", fr: "Profil", en: "Profile" },
        ] as { key: typeof activeTab; icon: string; fr: string; en: string }[]).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if ((tab.key === "messages" || tab.key === "profile") && !user) {
                  requireAuth(tab.key === "messages" ? "Connectez-vous pour accéder à vos messages." : "Connectez-vous pour accéder à votre profil.");
                }
              }}
              className={`mm-nitem flex-1 flex flex-col items-center justify-center gap-0.5 relative py-1.5 ${isActive ? "text-mokolo-red" : "text-mokolo-gray-600"}`}
            >
              <span className="mm-nicon text-xl leading-none">{tab.icon}</span>
              <span className={`text-[0.58rem] ${isActive ? "font-bold" : "font-medium"}`}>{lang === "fr" ? tab.fr : tab.en}</span>
              {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5.5 h-0.5 rounded-full bg-mokolo-red" />}
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
function ProductCard({ product, onChat, onAuthRequired, isAuth }: {
  product: Product; onChat: (p: Product, type: "normal" | "negotiated" | "wholesale") => void;
  onAuthRequired: (r: string) => void; isAuth: boolean;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const prices = { normal: product.priceTiers?.[0], negotiated: product.priceTiers?.[1], wholesale: product.priceTiers?.[2] };
  const variants = product.variants ?? [];

  return (
    <div className="mm-card bg-white border border-mokolo-gray-200 rounded-2xl overflow-hidden flex flex-col">
      <div className="mm-card-img w-full aspect-square bg-mokolo-gray-100 relative overflow-hidden">
        {product.images?.length > 0 ? (
          <img src={product.images[imgIdx] ?? product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {product.images?.length > 1 && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
            {product.images.slice(0, 4).map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-3.5 bg-white" : "w-1.5 bg-white/55"}`} />
            ))}
          </div>
        )}
        {prices.wholesale && <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[0.55rem] font-extrabold px-1.5 py-0.5 rounded">B2B</span>}
      </div>

      <div className="px-2.5 pt-2.5 pb-2 flex-1">
        <p className="text-[0.6rem] text-mokolo-gray-600 font-bold uppercase mb-0.5">{product.category}</p>
        <h3 className="text-[0.8rem] font-bold leading-snug mb-1.5 line-clamp-2">{product.title}</h3>
        {variants.length > 0 && (
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {variants.slice(0, 5).map((v, i) => (
              <div key={i} title={v.color} className="w-3.5 h-3.5 rounded-full border-[1.5px] border-mokolo-gray-200 shadow-sm cursor-pointer hover:scale-125 transition-transform" style={{ background: v.colorHex }} />
            ))}
            {variants.length > 5 && <span className="text-[0.6rem] text-mokolo-gray-600">+{variants.length - 5}</span>}
          </div>
        )}
        {product.shopName && <p className="text-[0.62rem] text-mokolo-gray-600">🏪 {product.shopName}</p>}
      </div>

      <div className="px-2.5 pb-2.5 flex flex-col gap-1.5">
        {prices.normal && (
          <Link href={`/produits/${product.id}`} className="mm-btn-red mm-ripple flex items-center justify-between text-white rounded-lg px-2.5 py-1.5 text-[0.72rem]">
            <span>Prix normal</span>
            <span className="font-black">{prices.normal.price.toLocaleString()} F</span>
          </Link>
        )}
        {prices.negotiated && (
          <button onClick={() => onChat(product, "negotiated")} className="mm-btn-black mm-ripple flex items-center justify-between text-white rounded-lg px-2.5 py-1.5 text-[0.72rem]">
            <span>💬 Négocier</span>
            <span className="font-black">{prices.negotiated.price.toLocaleString()} F</span>
          </button>
        )}
        {prices.wholesale && (
          <button
            onClick={() => { if (!isAuth) { onAuthRequired("Connectez-vous pour passer une commande en gros."); return; } onChat(product, "wholesale"); }}
            className="mm-btn-green mm-ripple flex items-center justify-between text-white rounded-lg px-2.5 py-1.5 text-[0.72rem]"
          >
            <span>📦 Gros ({prices.wholesale.minQty}+ u)</span>
            <span className="font-black">{prices.wholesale.price.toLocaleString()} F</span>
          </button>
        )}
        {!prices.normal && !prices.negotiated && !prices.wholesale && (
          <Link href={`/produits/${product.id}`} className="mm-btn-red mm-ripple block text-center text-white rounded-lg py-1.5 text-[0.72rem]">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-mokolo-gray-200 overflow-hidden">
          <div className="mm-skeleton w-full aspect-square" />
          <div className="p-2.5">
            <div className="mm-skeleton h-2.5 w-[55%] rounded mb-1.5" />
            <div className="mm-skeleton h-3.5 w-[90%] rounded mb-1.5" />
            <div className="mm-skeleton h-7 rounded mb-1.5" />
            <div className="mm-skeleton h-7 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
