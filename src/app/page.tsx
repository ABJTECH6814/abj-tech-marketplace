"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import SidebarLeft from "@/components/SidebarLeft";
import { PhoneMockup } from "@/components/ui/PhoneMockup";

interface PriceTier {
  minQty: number;
  price: number;
}

interface Product {
  id: string;
  title: string;
  category: string;
  images: string[];
  priceTiers: PriceTier[];
}

// Catégories réelles utilisées dans ProductManager — la grille reflète ce qui
// existe vraiment dans le schéma, pas une liste décorative inventée.
const CATEGORIES = [
  { label: "Téléphones & Électronique", icon: "📱" },
  { label: "Mode & Vêtements", icon: "👕" },
  { label: "Maison & Décoration", icon: "🏠" },
  { label: "Alimentation & Agro", icon: "🌾" },
  { label: "Beauté & Santé", icon: "💄" },
  { label: "Services B2B", icon: "🏢" },
];

export default function HomePage() {
  const { user, userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerCount, setSellerCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "ACTIVE"),
      orderBy("createdAt", "desc"),
      limit(12)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            title: data.title,
            category: data.category,
            images: data.images || [],
            priceTiers: data.priceTiers || [],
          });
        });
        setProducts(list);
        setLoadingProducts(false);
      },
      (err) => {
        console.error("Erreur chargement catalogue central :", err);
        setError("Impossible de charger le catalogue pour le moment.");
        setLoadingProducts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Compteurs réels (pas de chiffres marketing inventés) — agrégation
    // côté serveur Firestore, légère et peu coûteuse.
    async function fetchCounts() {
      try {
        const [sellersSnap, productsSnap] = await Promise.all([
          getCountFromServer(collection(db, "sellerProfiles")),
          getCountFromServer(query(collection(db, "products"), where("status", "==", "ACTIVE"))),
        ]);
        setSellerCount(sellersSnap.data().count);
        setProductCount(productsSnap.data().count);
      } catch (err) {
        console.error("Erreur comptage stats :", err);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="flex min-h-screen bg-mokolo-gray-50 text-mokolo-black">
      <SidebarLeft />

      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-mokolo-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4 md:hidden">
            <h1 className="font-heading text-lg font-bold text-mokolo-red">MOKOLO</h1>
          </div>
          <div className="w-full max-w-md hidden sm:block">
            <input
              type="text"
              placeholder="Rechercher un produit, une marque, un grossiste..."
              className="w-full bg-mokolo-gray-100 text-sm px-4 py-2 rounded-lg border border-transparent focus:border-mokolo-gray-200 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <span className="text-sm text-mokolo-gray-600">
                Bonjour, {userData?.firstName || "Client"}
              </span>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-mokolo-gray-600 hover:text-mokolo-black transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth?mode=seller"
                  className="px-4 py-2 text-sm font-medium bg-mokolo-red text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-all"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-10">
          {/* HERO — texte à gauche, PhoneMockup à droite, conforme au cahier des charges */}
          <section className="bg-mokolo-black text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-5 z-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-mokolo-red bg-mokolo-red-light/10 px-3 py-1 rounded-full border border-mokolo-red/30">
                  Fret &amp; Séquestre Garanti
                </span>
                <h1 className="font-heading text-4xl md:text-5xl font-black leading-tight">
                  MOKOLO <span className="text-mokolo-red">MARKET</span>
                </h1>
                <p className="text-base text-mokolo-gray-200 max-w-md">
                  La première marketplace B2B/B2C sécurisée au Cameroun. Achetez en gros ou
                  au détail — vos fonds restent bloqués tant que vous n&apos;avez pas validé
                  la livraison.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="#catalogue"
                    className="px-5 py-3 bg-mokolo-red text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all"
                  >
                    Commencer à acheter
                  </Link>
                  <Link
                    href="/auth?mode=seller"
                    className="px-5 py-3 bg-white text-mokolo-black rounded-lg font-semibold text-sm hover:bg-mokolo-gray-100 transition-all"
                  >
                    Devenir vendeur
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0 z-10">
                <PhoneMockup screenText="Welcome" />
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent hidden lg:block" />
          </section>

          {/* BANDE DE STATS — chiffres réels Firestore, pas marketing inventé */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              value={sellerCount === null ? "…" : sellerCount.toLocaleString()}
              label="Vendeurs inscrits"
            />
            <StatCard
              value={productCount === null ? "…" : productCount.toLocaleString()}
              label="Produits actifs"
            />
            <StatCard value="48h" label="Livraison standard" />
            <StatCard value="100%" label="Paiement séquestré" />
          </section>

          {/* CATÉGORIES VEDETTES */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg font-bold tracking-tight">
              Parcourir par catégorie
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/?category=${encodeURIComponent(cat.label)}`}
                  className="flex flex-col items-center justify-center gap-2 bg-white border border-mokolo-gray-200 rounded-xl p-4 text-center hover:border-mokolo-red hover:shadow-md transition-all"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-mokolo-gray-600 leading-tight">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* CATALOGUE CENTRALISÉ */}
          <section id="catalogue" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold tracking-tight">
                Arrivages récents &amp; tendances
              </h2>
              <span className="text-xs text-mokolo-red font-medium cursor-pointer hover:underline">
                Voir tout →
              </span>
            </div>

            {loadingProducts ? (
              <div className="text-sm text-mokolo-gray-600 py-10 text-center">
                Chargement du catalogue central...
              </div>
            ) : error ? (
              <div className="text-sm text-mokolo-red py-10 text-center">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-sm text-mokolo-gray-600 py-10 text-center border border-dashed border-mokolo-gray-200 rounded-xl">
                Aucun produit publié pour le moment. Les vendeurs inscrits peuvent
                publier depuis leur tableau de bord.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-mokolo-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="aspect-square bg-mokolo-gray-100 relative flex items-center justify-center overflow-hidden">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-mokolo-gray-600 uppercase font-semibold">
                        {product.category}
                      </p>
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-mokolo-red transition-colors">
                        {product.title}
                      </h3>

                      {product.priceTiers.length === 3 && (
                        <div className="pt-2 border-t border-mokolo-gray-100 grid grid-cols-3 gap-1 text-center text-[10px]">
                          <div className="bg-mokolo-gray-50 p-1 rounded">
                            <span className="block font-bold text-mokolo-black">
                              {product.priceTiers[0].minQty}+ u
                            </span>
                            <span className="text-mokolo-gray-600">
                              {product.priceTiers[0].price.toLocaleString()} F
                            </span>
                          </div>
                          <div className="bg-mokolo-gray-50 p-1 rounded">
                            <span className="block font-bold text-mokolo-red">
                              {product.priceTiers[1].minQty}+ u
                            </span>
                            <span className="text-mokolo-red">
                              {product.priceTiers[1].price.toLocaleString()} F
                            </span>
                          </div>
                          <div className="bg-mokolo-gray-50 p-1 rounded">
                            <span className="block font-bold text-green-600">
                              {product.priceTiers[2].minQty}+ u
                            </span>
                            <span className="text-green-600">
                              {product.priceTiers[2].price.toLocaleString()} F
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FOOTER MINIMAL — MVP */}
          <footer className="border-t border-mokolo-gray-200 pt-6 pb-10 text-xs text-mokolo-gray-600 flex flex-col sm:flex-row justify-between gap-3">
            <span>© {new Date().getFullYear()} MOKOLO Market — Propulsé par AbJ Tech</span>
            <div className="flex gap-4">
              <Link href="/auth" className="hover:text-mokolo-red transition-colors">
                Connexion
              </Link>
              <Link href="/auth?mode=seller" className="hover:text-mokolo-red transition-colors">
                Devenir vendeur
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-mokolo-gray-200 rounded-xl p-4 text-center">
      <div className="font-heading text-2xl font-black text-mokolo-black">{value}</div>
      <div className="text-xs text-mokolo-gray-600 mt-1">{label}</div>
    </div>
  );
}
