"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f8fafc', color: '#1e293b', minHeight: '100vh', margin: 0 }}>
      
      {/* 1. BANDEAU INFO VENDEURS */}
      <div style={{ backgroundColor: '#dc2626', color: '#ffffff', textAlign: 'center', padding: '10px 5%', fontSize: '0.9rem', fontWeight: '600' }}>
        📢 Vous êtes commerçant ? Créez un compte boutique sur Mokolo et vendez vos produits dès aujourd'hui !
      </div>

      {/* 2. NAVBAR AVEC TON LOGO MOKOLO ROUGE */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#dc2626', letterSpacing: '-1px' }}>
          MOKOLO<span style={{ color: '#1e293b' }}>.</span>
        </div>
        
        {/* Barre de recherche d'application */}
        <div style={{ display: 'flex', flexGrow: 0.5, maxWidth: '500px', margin: '0 20px' }}>
          <input type="text" placeholder="Rechercher un produit, une boutique..." style={{ width: '100%', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px 0 0 8px', outline: 'none', fontSize: '0.95rem' }} />
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: '600' }}>Aide</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontWeight: '600' }}>
          <button style={{ padding: '10px 20px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Espace Vendeur
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Connexion
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION INTÉGRANT LA VISION DE L'APPLICATION */}
      <header style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)', color: '#ffffff', padding: '80px 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Plateforme E-commerce Multi-Vendeurs
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginTop: '20px', marginBottom: '20px', lineHeight: '1.2' }}>
            Votre Marché en Ligne Sécurisé
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#fca5a5', marginBottom: '35px', lineHeight: '1.6' }}>
            Une application moderne conçue pour permettre aux vendeurs de créer leur espace, gérer leurs stocks et proposer leurs articles directement à une large clientèle.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button style={{ padding: '14px 28px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
              Découvrir les produits
            </button>
            <button style={{ padding: '14px 28px', backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
              Devenir Vendeur
            </button>
          </div>
        </div>
      </header>

      {/* 4. FLUX DE PRODUITS CONNECTÉ À FIREBASE */}
      <main style={{ padding: '60px 5%' }}>
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Les nouveautés du marché</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Articles mis en ligne en temps réel par nos marchands partenaires.</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Synchronisation avec la base de données Mokolo...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '2.5rem' }}>🏪</span>
            <h3 style={{ color: '#1e293b', margin: '15px 0 5px 0', fontSize: '1.2rem' }}>Le marché Mokolo est prêt !</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.95rem' }}>Aucun vendeur n'a encore publié d'article dans la collection "produits".</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dès qu'un marchand ajoutera un produit sur Firestore, il s'affichera ici instantanément.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {product.boutiqueNom || "Boutique"}
                  </span>
                  [ Image Article ]
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: '700' }}>{product.categorie || 'Général'}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: '8px 0 15px 0' }}>{product.nom || product.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#dc2626' }}>{product.prix || product.price} FCFA</span>
                    <button style={{ padding: '10px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. FOOTER DE L'APPLICATION */}
      <footer style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '40px 5%', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#ffffff', fontWeight: '800', margin: '0 0 10px 0' }}>MOKOLO MARKET</h3>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>&copy; 2026 Mokolo Application. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
