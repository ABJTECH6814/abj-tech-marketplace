import React from "react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-mokolo-gray-50 font-sans text-mokolo-black">
      {/* Sidebar Gauche Intégrée (Évite le bug d'import externe) */}
      <aside className="w-64 border-r border-mokolo-gray-200 bg-white p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-bold text-mokolo-red tracking-wider">MOKOLO</h1>
            <p className="text-xs text-mokolo-gray-600">By AbJ Tech</p>
          </div>
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-mokolo-gray-100 font-medium text-sm text-mokolo-black">
              <span>🛒</span>
              <span>Catalogue Global</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm text-mokolo-gray-600 hover:bg-mokolo-gray-50 transition-colors">
              <span>📦</span>
              <span>Mes Commandes</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm text-mokolo-gray-600 hover:bg-mokolo-gray-50 transition-colors">
              <span>💼</span>
              <span>Espace Vendeur</span>
            </a>
          </nav>
        </div>
        <div className="pt-4 border-t border-mokolo-gray-200 text-xs text-mokolo-gray-600">
          Forfait Spark Actif
        </div>
      </aside>

      {/* Zone de Contenu Principal */}
      <main className="flex-1 flex flex-col">
        {/* Topbar / Header */}
        <header className="h-16 border-b border-mokolo-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4 md:hidden">
            <h1 className="text-lg font-bold text-mokolo-red">MOKOLO</h1>
          </div>
          <div className="w-full max-w-md hidden sm:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher un produit, une marque, un grossiste..." 
                className="w-full bg-mokolo-gray-100 text-sm px-4 py-2 rounded-lg border border-transparent focus:border-mokolo-gray-200 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-mokolo-gray-600 hover:text-mokolo-black transition-colors">
              Connexion
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-mokolo-red text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-all">
              S'inscrire
            </button>
          </div>
        </header>

        {/* Corps de la Page (Layout Asymétrique Inspiré Alibaba) */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Section Héro / Bannière */}
          <div className="bg-mokolo-black text-white rounded-2xl p-8 relative overflow-hidden shadow-xl min-h-[240px] flex flex-col justify-center">
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-mokolo-red">Fret &amp; Séquestre Garanti</span>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">La première Marketplace B2B/B2C sécurisée au Cameroun</h2>
              <p className="text-sm text-mokolo-gray-200">Achetez en gros ou au détail. Vos fonds restent bloqués tant que vous n'avez pas validé la livraison.</p>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent hidden lg:block" />
          </div>

          {/* Grille du Catalogue Centralisé */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Arrivages Récents &amp; Tendances</h3>
              <span className="text-xs text-mokolo-red font-medium cursor-pointer hover:underline">Voir tout →</span>
            </div>

            {/* Grille Asymétrique des Produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-xl border border-mokolo-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="aspect-square bg-mokolo-gray-100 relative flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300">
                    {item === 1 && "👟"}
                    {item === 2 && "📱"}
                    {item === 3 && "🎧"}
                    {item === 4 && "🦷"}
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-mokolo-gray-600 uppercase font-semibold">Grossiste vérifié</p>
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-mokolo-red transition-colors">
                      {item === 1 && "Chaussures de Sport Haute Performance"}
                      {item === 2 && "Smartphone Next-Gen 128GB"}
                      {item === 3 && "Écouteurs Sans Fil Réduction de Bruit"}
                      {item === 4 && "Kit de Blanchiment Dentaire Professionnel"}
                    </h4>
                    
                    {/* Structure Strict des 3 Paliers de Prix (Modèle Alibaba du Cahier des Charges) */}
                    <div className="pt-2 border-t border-mokolo-gray-100 grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div className="bg-mokolo-gray-50 p-1 rounded">
                        <span className="block font-bold text-mokolo-black">1 - 5 u</span>
                        <span className="text-mokolo-gray-600">12 000 F</span>
                      </div>
                      <div className="bg-mokolo-gray-50 p-1 rounded">
                        <span className="block font-bold text-mokolo-red">6 - 49 u</span>
                        <span className="text-mokolo-red">10 500 F</span>
                      </div>
                      <div className="bg-mokolo-gray-50 p-1 rounded">
                        <span className="block font-bold text-green-600">50+ u</span>
                        <span className="text-green-600">8 500 F</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
