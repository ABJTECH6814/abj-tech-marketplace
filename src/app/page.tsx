"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  
  // États Menu Latéral
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Données de simulation
  const produitsExemples = [
    { id: '1', nom: 'Chaussure Sneaker Sport', boutiqueNom: 'AbJ Tech Urban', categorie: 'Mode', prix: 25000, prixBarre: 35000, reduction: 30 },
    { id: '2', nom: 'Smartphone Pro Max', boutiqueNom: 'Mokolo Gadgets', categorie: 'Électronique', prix: 450000, prixBarre: 520000, reduction: 13 },
    { id: '3', nom: 'Veste Bomber Noire', boutiqueNom: 'Kmer Style', categorie: 'Mode', prix: 18000, prixBarre: 24000, reduction: 25 },
    { id: '4', nom: 'Écouteurs Sans Fil Bass', boutiqueNom: 'Tech Elite', categorie: 'Électronique', prix: 15000, prixBarre: 30000, reduction: 50 },
  ];

  const categoriesExemples = [
    "Sélectionner une catégorie...",
    "Mode & Vêtements Homme",
    "Mode & Vêtements Femme",
    "Smartphones & Tablettes",
    "Électronique & Domotique",
    "Chaussures de sport",
    "Cosmétiques & Parfums",
    "Accessoires Informatiques"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "produits"), limit(10));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (productsList.length > 0) {
          setProducts(productsList);
        } else {
          setProducts(produitsExemples);
        }
      } catch (error) {
        console.error("Erreur Firebase Mokolo:", error);
        setProducts(produitsExemples);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'linear-gradient(135deg, #ff002b 0%, #b9001a 40%, #66000b 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        alignItems: 'center', padding: '40px 20px', zIndex: 9999, color: '#ffffff',
        fontFamily: 'Segoe UI, Roboto, Helvetica, sans-serif', boxSizing: 'border-box', overflow: 'hidden'
      }}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 'calc(2.5rem + 1.5vw)', fontWeight: '900', margin: 0, letterSpacing: '-2px', lineHeight: '0.9', textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                MOKOLO
              </h1>
              <p style={{ fontSize: 'calc(1rem + 0.3vw)', fontWeight: '600', margin: '5px 0 0 0', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.85)' }}>
                Marketplace
              </p>
            </div>
            <div style={{
              width: '45px', height: '80px', backgroundColor: '#000000', borderRadius: '10px', border: '2px solid #1a1a1a',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 0 3px rgba(255,255,255,0.2)', padding: '2px', boxSizing: 'border-box',
              position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <div style={{ position: 'absolute', top: '3px', width: '14px', height: '3px', backgroundColor: '#000000', borderRadius: '5px', zIndex: 10 }}></div>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #111827 0%, #030712 100%)', borderRadius: '7px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <span style={{ color: '#ffffff', fontSize: '0.45rem', fontWeight: '800', letterSpacing: '0.2px', textTransform: 'uppercase', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  Welcome
                </span>
              </div>
            </div>
          </div>
          <div style={{ width: '45px', height: '45px', backgroundColor: '#dc2626', border: '4px solid #ffffff', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1.2s linear infinite', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}></div>
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MOKOLO MARKET
          </p>
        </div>
        <style jsx global>{`
          @keyframes pulse { 0% { opacity: 0.7; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0.7; transform: scale(0.95); } }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f8fafc', color: '#1e293b', minHeight: '100vh', margin: 0, position: 'relative', overflowX: 'hidden' }}>
      
      {/* --- MENU LATÉRAL (DRAWER) --- */}
      <div style={{
        position: 'fixed', top: 0, left: isMenuOpen ? 0 : '-320px', width: '320px', height: '100vh',
        backgroundColor: '#ffffff', boxShadow: '4px 0 25px rgba(0,0,0,0.15)', zIndex: 200,
        transition: 'left 0.3s ease', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', color: '#ffffff' }}>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px' }}>OPTIONS MOKOLO</span>
          <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer', fontWeight: '700' }}>×</button>
        </div>

        <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📁 Catalogue Global</h4>
            <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#000000' }}>
              {categoriesExemples.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🛒 Mon Panier & Historique</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#16a34a', fontWeight: '700' }}>✓ Payé</span> - Commande #0492
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid #dc2626' }}>
                <span style={{ color: '#dc2626', fontWeight: '700' }}>✕ Annulé</span> - Redirection boutique active
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Centre d'aide</h4>
            <div style={{ padding: '12px', backgroundColor: '#fff7ed', border: '1px dashed #f97316', borderRadius: '8px', fontSize: '0.85rem', color: '#c2410c', lineHeight: '1.4' }}>
              <strong>Guide Rapide :</strong> Liens uniques marchands et CRM de négociation intelligents actifs.
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                ⚠️ Supprimer mon compte
              </button>
            ) : (
              <div style={{ backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #dc2626', borderRadius: '4px', marginBottom: '8px', color: '#000' }} placeholder="SUPPRIMER" />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => { if(deleteInput === 'SUPPRIMER') { alert('Compte supprimé.'); setIsMenuOpen(false); } }} style={{ flex: 1, padding: '5px', backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Confirmer</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '5px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', cursor: 'pointer' }}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Link href="/connexion" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Se Connecter au Compte
            </button>
          </Link>
        </div>
      </div>

      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 150 }} />}

      {/* --- SITE PRINCIPAL --- */}
      <div style={{ backgroundColor: '#dc2626', color: '#ffffff', textAlign: 'center', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600' }}>
        📢 Espace Marchand : Créez votre vitrine unique, partagez votre lien et vendez sur la Marketplace !
      </div>

      <nav style={{ 
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', 
        padding: '15px 4%', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', 
        position: 'sticky', top: 0, zIndex: 100, gap: '15px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setIsMenuOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Menu</button>
          <Link href="/connexion" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Connexion</button>
          </Link>
        </div>

        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#dc2626', letterSpacing: '-1px' }}>
          MOKOLO<span style={{ color: '#1e293b' }}>.</span>
        </div>
        
        <div style={{ display: 'flex', flexGrow: 1, minWidth: '280px', maxWidth: '500px' }}>
          <input type="text" placeholder="Rechercher un produit sur tout le marché..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px 0 0 8px', outline: 'none', fontSize: '0.9rem' }} />
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: '600' }}>Filtre</button>
        </div>
      </nav>

      {/* HERO SECTION DE LA MARKETPLACE */}
      <header style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)', color: '#ffffff', padding: '60px 4%', textAlign: 'center' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Réseau Omnicanal Multi-Boutiques
          </span>
          {/* Ligne 215 corrigée : marginBottom valide */}
          <h1 style={{ fontSize: 'calc(1.8rem + 1.2vw)', fontWeight: '800', marginTop: '15px', marginBottom: '15px', lineHeight: '1.2' }}>
            Votre Boutique Unique au Cœur du Grand Marché
          </h1>
          <p style={{ fontSize: 'calc(0.95rem + 0.1vw)', color: '#fca5a5', marginBottom: '25px', lineHeight: '1.5' }}>
            Chaque vendeur possède son lien exclusif pour acquérir ses propres clients, tout en exposant automatiquement ses stocks sur la marketplace commune Mokolo.
          </p>
        </div>
      </header>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main style={{ padding: '25px 4%' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔥 Flux du Marché Central
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Vérification du marché...</p>
        ) : (
          <div>
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                  border: '2px solid #ef4444', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#000000', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '700', zIndex: 5 }}>
                    {product.boutiqueNom}
                  </span>

                  <div style={{ height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    [ Image ]
                  </div>

                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontSize: '0.65rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: '800' }}>{product.categorie}</span>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: '4px 0 10px 0', lineHeight: '1.3', height: '2.4em', overflow: 'hidden' }}>{product.nom}</h3>
                    
                    <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ff002b' }}>
                        {product.prix.toLocaleString()} FCFA
                      </span>
                      
                      {product.prixBarre && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            color: 'rgba(220, 38, 38, 0.4)', 
                            textDecoration: 'line-through',
                            fontWeight: '600'
                          }}>
                            {product.prixBarre.toLocaleString()} FCFA
                          </span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            backgroundColor: 'rgba(254, 242, 242, 0.7)', 
                            color: '#dc2626', 
                            padding: '1px 5px', 
                            borderRadius: '4px',
                            fontWeight: '700',
                            filter: 'blur(0.2px)'
                          }}>
                            -{product.reduction}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                      <button onClick={() => alert('Redirection vers le paiement sécurisé')} style={{ width: '100%', padding: '8px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Acheter
                      </button>
                      <button onClick={() => alert('Ouverture du Chat CRM de Négociation Marketing')} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Négocier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
              🔄 Chargement des produits Mokolo en continu...
            </div>
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '30px 20px', textAlign: 'center', borderTop: '1px solid #cbd5e1', marginTop: '40px' }}>
        <h3 style={{ color: '#ffffff', fontWeight: '800', margin: '0 0 5px 0', fontSize: '1.1rem' }}>MOKOLO MARKETPLACE</h3>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>&copy; 2026 AbJ Tech Solutions. Tous droits réservés.</p>
      </footer>

      <style jsx global>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
          }
        }
      `}</style>

    </div>
  );
}
fix: correction typo style hero section
