"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import SidebarLeft from "@/components/SidebarLeft";

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

export default function HomePage() {
  const { user, userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Écoute en temps réel du catalogue centralisé — dès qu'un vendeur publie
    // via ProductManager, le produit apparaît ici automatiquement.
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

  return (
    <div className="flex min-h-screen bg-mokolo-gray-50 font-sans text-mokolo-black">
      <SidebarLeft />

      <main className="flex-1 flex flex-col">
        {/* Topbar / Header */}
        <header className="h-16 border-b border-mokolo-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4 md:hidden">
            <h1 className="text-lg font-bold text-mokolo-red">MOKOLO</h1>
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

        {/* Corps de la Page */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero */}
          <div className="bg-mokolo-black text-white rounded-2xl p-8 relative overflow-hidden shadow-xl min-h-[240px] flex flex-col justify-center">
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-mokolo-red">
                Fret &amp; Séquestre Garanti
              </span>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                La première Marketplace B2B/B2C sécurisée au Cameroun
              </h2>
              <p className="text-sm text-mokolo-gray-200">
                Achetez en gros ou au détail. Vos fonds restent bloqués tant que vous n&apos;avez
                pas validé la livraison.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent hidden lg:block" />
          </div>

          {/* Grille du Catalogue Centralisé — données réelles Firestore */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Arrivages Récents &amp; Tendances</h3>
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
                    className="bg-white rounded-xl border border-mokolo-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
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
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-mokolo-red transition-colors">
                        {product.title}
                      </h4>

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
        </div>
      </main>
    </div>
  );
}
