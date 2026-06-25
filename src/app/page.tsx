"use client";

import React, { useState, useEffect } from 'react';
import { SplashPage } from '@/components/ui/SplashPage';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { AuthSection } from '@/components/auth/AuthSection';

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'automation' | 'compta' | 'panier' | 'auth'>('feed');
  const [userSession, setUserSession] = useState<{ uid: string; isSeller: boolean } | null>(null);

  // Gestion rigoureuse du chronomètre (5 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleAuthSuccess = (uid: string, isSeller: boolean) => {
    setUserSession({ uid, isSeller });
    setActiveTab('feed'); // Redirection sur le flux central après succès
  };

  const handleLogout = () => {
    setUserSession(null);
    setActiveTab('feed');
  };

  // 1️⃣ Affichage prioritaire de la Splash Page pendant 5s
  if (showSplash) {
    return <SplashPage countdown={countdown} />;
  }

  // 2️⃣ Fin des 5 secondes : Affichage de la Marketplace omnicanale
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9F9F9', color: '#1A1A1A' }}>
      
      {/* CONTROLE GAUCHE */}
      <SidebarLeft 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSeller={userSession?.isSeller || false} 
        onLogout={handleLogout} 
      />

      {/* ZONE CENTRALE D'AFFICHAGE DU SERVEUR CENTRAL */}
      <main style={{ flexGrow: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', height: '100vh' }}>
        
        {activeTab === 'feed' && (
          <div>
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Filtrer et rechercher sur le serveur central (Mokolo Market)..." 
                style={{ flexGrow: 1, padding: '14px 18px', borderRadius: '8px', border: '1px solid #E5E5E5', outline: 'none', fontSize: '0.95rem' }} 
              />
              <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', fontWeight: '600' }}>
                <option>Tous les Catalogues</option>
                <option>Téléphones & Électronique</option>
                <option>Mode & Vêtements</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px solid #E5E5E5', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontWeight: '800' }}>Flux Global de Marché</h3>
              <p style={{ color: '#666666', margin: 0, fontSize: '0.9rem' }}>Les articles des bases de données de tous les vendeurs s'afficheront ici de manière synchronisée.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <div style={{ padding: '20px' }}>📊 [Module de configuration des Pixels - Étape 4]</div>}
        {activeTab === 'automation' && <div style={{ padding: '20px' }}>🤖 [Module de routage d'emails Resend API - Étape 4]</div>}
        {activeTab === 'compta' && <div style={{ padding: '20px' }}>💰 [Module financiers et requêtes de retraits - Étape 4]</div>}
        {activeTab === 'panier' && <div style={{ padding: '20px' }}>🛒 [Module panier commun et traçabilité Escrow - Étape 5]</div>}
        {activeTab === 'auth' && (
          <div style={{ maxWidth: '450px', margin: '0 auto' }}>
            <AuthSection onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </main>

      {/* CONTROLE DROIT : ESPACE CONNEXION/INSCRIPTION ACCESSIBLE PAR DÉFAUT */}
      <aside style={{
        width: '300px',
        backgroundColor: '#FFFFFF',
        borderLeft: '1px solid #E5E5E5',
        padding: '25px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {!userSession ? (
          <AuthSection onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#FFF0F2', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
            <span style={{ fontSize: '0.8rem', color: '#666666', display: 'block', marginBottom: '4px' }}>Session active</span>
            <strong style={{ fontSize: '0.95rem', color: '#A51C2B' }}>Utilisateur Connecté</strong>
          </div>
        )}
      </aside>

    </div>
  );
}
