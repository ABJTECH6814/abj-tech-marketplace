"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneMockup } from '@/components/ui/PhoneMockup';

export default function HomePage() {
  const router = useRouter();
  
  // États de contrôle
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'automation' | 'compta' | 'panier' | 'infos'>('feed');
  const [isSeller, setIsSeller] = useState(false); // Simule le rôle de l'utilisateur

  // États des formulaires du Dashboard Vendeur
  const [pixelFB, setPixelFB] = useState('');
  const [pixelTikTok, setPixelTikTok] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [emails, setEmails] = useState(['', '', '']);
  const [showRetraitForm, setShowRetraitForm] = useState(false);
  const [retraitForm, setRetraitForm] = useState({ nom: '', telephone: '' });

  // États du formulaire d'ajout produit (IA 3 Prix)
  const [productForm, setProductForm] = useState({
    titre: '', description: '', catalogue: 'Électronique',
    prixPublic: '', prixIntermediaire: '', prixPlancher: '', stock: '1'
  });

  // Compte à rebours du Splash Screen (5 secondes strictes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(splashTimeout);
    };
  }, []);

  // Produits simulés sur le Serveur Central
  const centralServerProducts = [
    { id: '1', titre: 'Smartphone Pro Max', catalogue: 'Électronique', prix: '450,000 XAF', image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400', shop: 'Boutique Alpha' },
    { id: '2', titre: 'Chaussure Homme Cuir', catalogue: 'Mode', prix: '25,000 XAF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', shop: 'Mokolo Chic' },
    { id: '3', titre: 'Sac à Main de Luxe', catalogue: 'Mode', prix: '45,000 XAF', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', shop: 'Espace Élégance' },
    { id: '4', titre: 'Ordinateur Portable i7', catalogue: 'Électronique', prix: '380,000 XAF', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', shop: 'Tech Express' },
  ];

  const [filteredCatalog, setFilteredCatalog] = useState('Tous');

  // ==========================================
  // I. INTERFACE INTERMÉDIAIRE : SPLASH SCREEN (5s)
  // ==========================================
  if (showSplash) {
    return (
      <div style={{
        height: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif'
      }}>
        {/* Alignement des dimensions exactes : Téléphone au-dessus du logo */}
        <PhoneMockup screenText="Welcome" />
        
        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <h1 style={{ color: '#0F0F0F', fontSize: '2.2rem', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '1px' }}>
            MOKOLO Market
          </h1>
          <p style={{ color: '#D72638', fontSize: '1rem', fontWeight: '700', margin: '0 0 20px 0', uppercase: 'true' }}>
            Welcome to ABJ Tech
          </p>
          <div style={{
            display: 'inline-block', backgroundColor: '#FFF0F2', color: '#A51C2B',
            padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid #E5E5E5'
          }}>
            Ouverture sécurisée dans {countdown}s
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // II. INTERFACE PRINCIPALE DE LA MARKETPLACE
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9F9F9', fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      
      {/* ⬅️ MENU LATÉRAL GAUCHE */}
      <aside style={{ width: '320px', backgroundColor: '#0F0F0F', color: '#FFFFFF', padding: '25px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1A1A1A' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#D72638', margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>MOKOLO Market</h2>
          <span style={{ fontSize: '0.7rem', color: '#666666' }}>BY ABJ TECH AGENCY</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button onClick={() => { setActiveTab('feed'); setFilteredCatalog('Tous'); }} style={{ textAlign: 'left', padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'feed' ? '#D72638' : 'transparent', color: '#FFF', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            📦 Catalogues & Marché Central
          </button>

          {/* Section exclusive Vendeur */}
          <div style={{ marginTop: '15px', borderTop: '1px solid #1A1A1A', paddingTop: '15px' }}>
            <span style={{ fontSize: '0.75rem', color: '#666666', paddingLeft: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Dashboard Vendeur</span>
            <button onClick={() => { setIsSeller(true); setActiveTab('analytics'); }} style={{ textAlign: 'left', width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', backgroundColor: activeTab === 'analytics' ? '#1A1A1A' : 'transparent', color: '#FFF', border: 'none', cursor: 'pointer' }}>
              📈 Pixels & Analytics
            </button>
            <button onClick={() => { setIsSeller(true); setActiveTab('automation'); }} style={{ textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'automation' ? '#1A1A1A' : 'transparent', color: '#FFF', border: 'none', cursor: 'pointer' }}>
              🤖 Relances Automatiques (Email)
            </button>
            <button onClick={() => { setIsSeller(true); setActiveTab('compta'); }} style={{ textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'compta' ? '#1A1A1A' : 'transparent', color: '#FFF', border: 'none', cursor: 'pointer' }}>
              💰 Comptabilité & Retraits
            </button>
          </div>

          {/* Espace Commun */}
          <div style={{ marginTop: '15px', borderTop: '1px solid #1A1A1A', paddingTop: '15px' }}>
            <button onClick={() => setActiveTab('panier')} style={{ textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'panier' ? '#1A1A1A' : 'transparent', color: '#FFF', border: 'none', cursor: 'pointer' }}>
              🛒 Panier Commun & Suivi
            </button>
            <button onClick={() => setActiveTab('infos')} style={{ textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'infos' ? '#1A1A1A' : 'transparent', color: '#FFF', border: 'none', cursor: 'pointer' }}>
              ℹ️ Informations Générales
            </button>
          </div>
        </nav>

        {/* Pied du menu gauche avec connexions */}
        <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => router.push('/rapport')} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#1A1A1A', color: '#FFF', border: '1px solid #666666', cursor: 'pointer', fontSize: '0.85rem' }}>
            🔗 Connexion / Inscription Officielle
          </button>
          <button onClick={() => { setIsSeller(false); setActiveTab('feed'); }} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#A51C2B', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            🚪 Se Déconnecter
          </button>
        </div>
      </aside>

      {/* 🗺️ ZONE CENTRALE D'AFFICHAGE DYNAMIQUE */}
      <main style={{ flexGrow: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', height: '100vh' }}>
        
        {/* Onglet 1 : Flux Central de la Marketplace */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input type="text" placeholder="Rechercher un produit sur le serveur central..." style={{ flexGrow: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E5E5', outline: 'none' }} />
              <select value={filteredCatalog} onChange={(e) => setFilteredCatalog(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E5E5', backgroundColor: '#FFF' }}>
                <option value="Tous">Tous les Catalogues</option>
                <option value="Électronique">Électronique</option>
                <option value="Mode">Mode</option>
              </select>
            </div>

            <h3 style={{ textTransform: 'uppercase', fontSize: '1rem', fontWeight: '800', color: '#666666', marginBottom: '20px' }}>
              🔥 Serveur Central Multi-Vendeurs
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {centralServerProducts
                .filter(p => filteredCatalog === 'Tous' || p.catalogue === filteredCatalog)
                .map((prod) => (
                  <div key={prod.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E5E5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '160px', backgroundColor: '#E5E5E5', position: 'relative' }}>
                      <img src={prod.image} alt={prod.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#0F0F0F', color: '#FFF', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}>{prod.shop}</span>
                    </div>
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '700' }}>{prod.titre}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#D72638', fontWeight: '800' }}>{prod.prix}</span>
                        <button style={{ backgroundColor: '#FFF0F2', color: '#D72638', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Acheter</button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet 2 : Configuration Analytics & Pixels */}
        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Saisie des Pixels Analytiques (Facebook, TikTok, GTM)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>ID Pixel Facebook</label>
                <input type="text" value={pixelFB} onChange={(e) => setPixelFB(e.target.value)} placeholder="Insérer le pixel Facebook" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>ID Pixel TikTok</label>
                <input type="text" value={pixelTikTok} onChange={(e) => setPixelTikTok(e.target.value)} placeholder="Insérer le pixel TikTok" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Google Tag Manager (GTM)</label>
                <input type="text" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
              </div>
              <button onClick={() => alert('Configuration analytique enregistrée !')} style={{ backgroundColor: '#D72638', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>Sauvegarder les Traqueurs</button>
            </div>
          </div>
        )}

        {/* Onglet 3 : Automatisation Relance Mail API Resend */}
        {activeTab === 'automation' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Configuration de l'Automatisation de Relance</h3>
            <p style={{ color: '#666666', fontSize: '0.85rem', marginBottom: '20px' }}>Saisissez jusqu'à 3 adresses email maximum pour configurer le système de relance automatique de paniers via l'API Resend.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emails.map((email, index) => (
                <div key={index}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Email de Notification {index + 1}</label>
                  <input type="email" value={email} onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[index] = e.target.value;
                    setEmails(newEmails);
                  }} placeholder="vendeur@exemple.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
                </div>
              ))}
              <button onClick={() => alert('Emails connectés au CRM Resend Automation !')} style={{ backgroundColor: '#0F0F0F', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>Activer le Flux d'Automatisation</button>
            </div>
          </div>
        )}

        {/* Onglet 4 : Comptabilité, Solde, Formulaire de Retrait et Gestion des 3 Prix IA */}
        {activeTab === 'compta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Sous-section Solde */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#666666' }}>SOLDE COMPTABLE DISPONIBLE</span>
                <h2 style={{ fontSize: '2.2rem', margin: '5px 0 0 0', color: '#A51C2B', fontWeight: '900' }}>1,250,000 XAF</h2>
              </div>
              <button onClick={() => setShowRetraitForm(true)} style={{ backgroundColor: '#D72638', color: '#FFF', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(215,38,56,0.2)' }}>
                Effectuer un Retrait
              </button>
            </div>

            {/* Formulaire Modal de Retrait Déclenché */}
            {showRetraitForm && (
              <div style={{ backgroundColor: '#FFF0F2', padding: '25px', borderRadius: '12px', border: '1px solid #D72638' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#A51C2B' }}>Demande de Transfert de Fonds</h4>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <input type="text" placeholder="Nom Complet du Bénéficiaire" value={retraitForm.nom} onChange={(e) => setRetraitForm({...retraitForm, nom: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
                  <input type="tel" placeholder="Numéro Mobile Money / Orange Money" value={retraitForm.telephone} onChange={(e) => setRetraitForm({...retraitForm, telephone: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { alert('Requête de retrait soumise à ABJ Tech Agency.'); setShowRetraitForm(false); }} style={{ backgroundColor: '#A51C2B', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Confirmer le Retrait</button>
                  <button onClick={() => setShowRetraitForm(false)} style={{ backgroundColor: 'transparent', color: '#666666', border: 'none', cursor: 'pointer' }}>Annuler</button>
                </div>
              </div>
            )}

            {/* Formulaire d'Ajout Produit Standardisé avec CRM/IA de Négociation (3 Prix) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>Ajouter un Article au Serveur Central</h3>
              <p style={{ color: '#666666', fontSize: '0.8rem', marginBottom: '20px' }}>Uploadez vos photos (minimum 4 exigées) et configurez les paliers de prix pour le CRM de négociation par IA.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input type="text" placeholder="Titre de l'article" style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }} />
                  <select style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5' }}>
                    <option>Électronique</option>
                    <option>Mode</option>
                  </select>
                </div>

                <textarea placeholder="Description complète du produit..." rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontFamily: 'inherit' }} />

                {/* Bloc Simulateur d'Images (Min 4 Photos) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Galerie Produit (Minimum 4 Photos Obligatoires)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} style={{ width: '70px', height: '70px', border: '2px dashed #CBD5E1', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', color: '#94A3B8', backgroundColor: '#F8FAFC' }}>+</div>
                    ))}
                  </div>
                </div>

                {/* Bloc des 3 Niveaux de Prix pour la Négociation IA */}
                <div style={{ backgroundColor: '#F9F9F9', padding: '15px', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F0F0F', display: 'block', marginBottom: '10px' }}>🤖 PALIERS DE NÉGOCIATION POUR L'IA INTEGRÉE (CRM)</span>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#666666' }}>1. Prix Public (Affiché)</label>
                      <input type="number" placeholder="Ex: 10000" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #E5E5E5' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#666666' }}>2. Prix Intermédiaire</label>
                      <input type="number" placeholder="Ex: 9000" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #E5E5E5' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#666666' }}>3. Prix Plancher (Secret)</label>
                      <input type="number" placeholder="Ex: 8000" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #E5E5E5' }} />
                    </div>
                  </div>
                </div>

                <button onClick={() => alert('Produit publié sur la page d\'accueil et injecté dans le serveur central centralisé !')} style={{ backgroundColor: '#D72638', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Injecter le produit dans la Base Centrale</button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet 5 : Panier Commun & Traçabilité Séquestre / Livreurs */}
        {activeTab === 'panier' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>Votre Panier Unique & Suivi</h3>
            <p style={{ color: '#666666', fontSize: '0.85rem', marginBottom: '25px' }}>Espace partagé acheteur/vendeur pour le suivi en temps réel des commandes séquestrées.</p>
            
            <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#F9F9F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #E5E5E5', paddingBottom: '10px' }}>
                <div>
                  <strong>Commande #MK-8841</strong><br />
                  <span style={{ fontSize: '0.8rem', color: '#666666' }}>Fournisseur : Boutique Alpha</span>
                </div>
                <span style={{ backgroundColor: '#FFF0F2', color: '#D72638', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>FONDS SÉQUESTRÉS</span>
              </div>

              {/* Barre d'étape de transit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#A51C2B', fontWeight: '700', marginBottom: '20px' }}>
                <span>✓ Payé (Escrow)</span>
                <span>⚡ En Cours de Livraison</span>
                <span style={{ color: '#666666' }}>○ Reçu & Débloqué</span>
              </div>

              {/* Interface d'action Livreur simulée */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '6px', border: '1px solid #E5E5E5', marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#666666', display: 'block', marginBottom: '8px' }}>🤖 INTERFACE MOBILE DU LIVREUR (SUIVI TEMPS RÉEL)</span>
                <button onClick={() => alert('Position de transit synchronisée instantanément sur les boîtes mail et comptes clients !')} style={{ backgroundColor: '#0F0F0F', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                  Déclencher Étape Suivante Livraison
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet 6 : Mentions & Infos Générales */}
        {activeTab === 'infos' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E5E5E5' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Informations & Politiques Omnicanales</h3>
            <p style={{ lineHeight: '1.6', color: '#666666' }}>
              MOKOLO Market est une infrastructure e-commerce centralisée propulsée par <strong>ABJ Tech Agency</strong>. Tous les marchands publient au sein d'un cluster unique tout en conservant une autonomie complète sur le tracking marketing (Pixels), leurs stratégies de tarification automatisées par IA, et leurs flux de trésorerie financière.
            </p>
          </div>
        )}
      </main>

      {/* ➡️ CÔTÉ DROIT : FILTRAGE COMPACT DE CONNEXION CLIENT COMPATIBLE */}
      <aside style={{ width: '280px', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E5E5E5', padding: '25px 20px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', fontWeight: '800' }}>Accès Client Rapide</h4>
          <p style={{ fontSize: '0.75rem', color: '#666666', margin: 0 }}>Connectez-vous simplement pour acheter sur la plateforme.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Adresse Email client" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem' }} />
          <input type="password" placeholder="Mot de passe" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem' }} />
          <a href="#" style={{ fontSize: '0.75rem', color: '#666666', textDecoration: 'none', textAlign: 'right', fontWeight: '600' }}>Mot de passe oublié ?</a>
          <button onClick={() => alert('Connecté avec succès en tant que Client Acheteur !')} style={{ width: '100%', backgroundColor: '#0F0F0F', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Se Connecter</button>
        </div>

        <div style={{ marginTop: 'auto', backgroundColor: '#FFF0F2', padding: '15px', borderRadius: '8px', border: '1px solid #E5E5E5', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#A51C2B', display: 'block', marginBottom: '8px' }}>Vous voulez vendre ?</span>
          <button onClick={() => router.push('/rapport')} style={{ width: '100%', backgroundColor: '#D72638', color: '#FFF', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Créer mon Espace Vendeur</button>
        </div>
      </aside>

    </div>
  );
}
