"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 1. Gestion du Splash Screen de 3 secondes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    // 2. Récupération des produits Mokolo depuis Firebase
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "produits"), limit(8));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Erreur Firebase Mokolo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => clearTimeout(timer);
  }, []);

  // --- ÉCRAN DE DÉMARRAGE (SPLASH SCREEN 3 SECONDES) ---
  if (showSplash) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#dc2626',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: '#ffffff',
        fontFamily: 'Segoe UI, Roboto, sans-serif'
      }}>
        <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' }}>
          MOKOLO<span style={{ color: '#1e293b' }}>.</span>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#fca5a5', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '30px' }}>
          Chargement du Marché...
        </div>
        {/* Icône de sablier d'attente */}
        <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>⏳</div>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f8fafc', color: '#1e293b', minHeight: '100vh', margin: 0 }}>
      
      {/* 1. BANDEAU INFO RESPONSIVE */}
      <div style={{ backgroundColor: '#dc2626', color: '#ffffff', textAlign: 'center', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600' }}>
        📢 Espace Marchand : Créez votre vitrine unique, partagez votre lien et vendez sur la Marketplace !
      </div>

      {/* 2. BARRE DE NAVIGATION ULTRA-RESPONSIVE */}
      <nav style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 4%', 
        backgroundColor: '#ffffff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        gap: '15px'
      }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#dc2626', letterSpacing: '-1px' }}>
          MOKOLO<span style={{ color: '#1e293b' }}>.</span>
        </div>
        
        {/* Barre de recherche adaptative */}
        <div style={{ display: 'flex', flexGrow: 1, minWidth: '280px', maxWidth: '500px' }}>
          <input type="text" placeholder="Rechercher produit, boutique..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px 0 0 8px', outline: 'none', fontSize: '0.9rem' }} />
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: '600' }}>Aide</button>
        </div>

        {/* Boutons d'action responsives */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            Espace Vendeur
          </button>
          <button style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            Connexion
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION ZONE RESPONSIVE */}
      <header style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)', color: '#ffffff', padding: '60px 4%', textAlign: 'center' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Réseau Omnicanal Multi-Boutiques
          </span>
          <h1 style={{ fontSize: 'calc(1.8rem + 1.2vw)', fontWeight: '800', marginTop: '15px', marginBottom: '15px', lineHeight: '1.2' }}>
            Votre Boutique Unique au Cœur du Grand Marché
          </h1>
          <p style={{ fontSize: 'calc(0.95rem + 0.1vw)', color: '#fca5a5', marginBottom: '25px', lineHeight: '1.5' }}>
            Chaque vendeur possède son lien exclusif pour acquérir ses propres clients, tout en exposant automatiquement ses stocks sur la marketplace commune Mokolo.
          </p>
        </div>
      </header>

      {/* 4. ZONE DE CONTENU PRINCIPALE (GRILLE RESPONSIVE SANS BUG) */}
      <main style={{ padding: '40px 4%' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Vérification des collections Mokolo...</p>
        ) : products.length === 0 ? (
          
          /* Zone Vide : Message d'accueil Marchand connecté */
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', maxWidth: '550px', margin: '0 auto' }}>
            <span style={{ fontSize: '3rem' }}>🏪</span>
            <h3 style={{ color: '#1e293b', margin: '15px 0 10px 0', fontSize: '1.4rem', fontWeight: '800' }}>
              Bienvenue sur Mokolo Marketplace
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
              L'infrastructure est prête et connectée avec succès ! Les futurs liens uniques marchands (`/boutique/ma-vitrine`) redirigeront ici pour explorer tout le marché.
            </p>
            
            <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px dashed #fca5a5', marginBottom: '20px', textAlign: 'left' }}>
              <h4 style={{ color: '#dc2626', margin: '0 0 5px 0', fontWeight: '700', fontSize: '0.95rem' }}>💡 Principe des Liens Indépendants :</h4>
              <p style={{ color: '#7f1d1d', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                Un client cliquant sur le lien d'un produit arrivera ciblé sur celui-ci, mais un bouton "Visiter le Marché Central" lui permettra de remonter pour découvrir les articles des autres vendeurs.
              </p>
            </div>

            <button 
              onClick={() => alert("Étape Suivante : Configuration de la création des fiches Boutiques individuelles ! 🚀")}
              style={{ width: '100%', padding: '12px 24px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}
            >
              🚀 Ouvrir ma boutique & Obtenir mon Lien
            </button>
          </div>
        ) : (
          
          /* Grille d'articles s'adaptant magiquement aux téléphones, tablettes et PC */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                    {product.boutiqueNom || "Marchand Mokolo"}
                  </span>
                  [ Image Produit ]
                </div>
                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: '700' }}>{product.categorie || 'Général'}</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '5px 0 12px 0' }}>{product.nom || product.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#dc2626' }}>{product.prix || product.price} FCFA</span>
                    <button style={{ padding: '8px 12px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Voir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. FOOTER MULTI-ÉCRANS */}
      <footer style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '30px 20px', textAlign: 'center', borderTop: '1px solid #cbd5e1', marginTop: '40px' }}>
        <h3 style={{ color: '#ffffff', fontWeight: '800', margin: '0 0 5px 0', fontSize: '1.1rem' }}>MOKOLO MARKETPLACE</h3>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>&copy; 2026 AbJ Tech Solutions. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
