"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SidebarLeft() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 border-r border-mokolo-gray-200 bg-white p-6 hidden md:flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-mokolo-red tracking-wider">MOKOLO</h1>
          <p className="text-xs text-mokolo-gray-600">By AbJ Tech</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-mokolo-gray-100 font-medium text-sm text-mokolo-black"
          >
            <span>🛒</span>
            <span>Catalogue Global</span>
          </Link>

          <Link
            href="/panier"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm text-mokolo-gray-600 hover:bg-mokolo-gray-50 transition-colors"
          >
            <span>🧺</span>
            <span>Mon Panier</span>
          </Link>

          {userData?.isSeller ? (
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm text-mokolo-gray-600 hover:bg-mokolo-gray-50 transition-colors"
            >
              <span>💼</span>
              <span>Espace Vendeur</span>
            </Link>
          ) : user ? (
            <Link
              href="/auth?mode=seller"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm text-mokolo-red hover:bg-mokolo-red-light transition-colors"
            >
              <span>💼</span>
              <span>Devenir Vendeur</span>
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="pt-4 border-t border-mokolo-gray-200">
        {loading ? (
          <span className="text-xs text-mokolo-gray-600">Chargement...</span>
        ) : user ? (
          <div className="space-y-2">
            <p className="text-xs text-mokolo-gray-600 truncate">
              Connecté : {userData?.firstName || user.email}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left text-xs font-semibold text-mokolo-red hover:underline"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <Link href="/auth" className="block text-xs font-semibold text-mokolo-red hover:underline">
            Se connecter
          </Link>
        )}
      </div>
    </aside>
  );
}
