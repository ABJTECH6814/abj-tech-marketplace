"use client";

import React from 'react';

interface SidebarLeftProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isSeller: boolean;
  onLogout: () => void;
}

export function SidebarLeft({ activeTab, setActiveTab, isSeller, onLogout }: SidebarLeftProps) {
  return (
    <aside style={{
      width: '320px',
      backgroundColor: '#0F0F0F',
      color: '#FFFFFF',
      padding: '25px 20px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #1A1A1A',
      boxSizing: 'border-box',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Header Marque */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#D72638', margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px' }}>
          MOKOLO Market
        </h2>
        <span style={{ fontSize: '0.7rem', color: '#666666', fontWeight: '700', letterSpacing: '0.5px' }}>
          PROPULSÉ PAR ABJ TECH
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, overflowY: 'auto' }}>
        <button 
          onClick={() => setActiveTab('feed')} 
          style={{
            textAlign: 'left', padding: '12px', borderRadius: '8px', 
            backgroundColor: activeTab === 'feed' ? '#D72638' : 'transparent', 
            color: '#FFFFFF', border: 'none', fontWeight: '600', cursor: 'pointer'
          }}
        >
          📦 Catalogues & Marché Central
        </button>

        {/* Section Vendeur Isolée (Dashboard) */}
        <div style={{ marginTop: '15px', borderTop: '1px solid #1A1A1A', paddingTop: '15px' }}>
          <span style={{ fontSize: '0.7rem', color: '#666666', paddingLeft: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Dashboard Vendeur
          </span>
          
          <button 
            onClick={() => setActiveTab('analytics')} 
            style={{
              textAlign: 'left', width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', 
              backgroundColor: activeTab === 'analytics' ? '#1A1A1A' : 'transparent', 
              color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            📈 Pixels & Analytics (FB/TikTok)
          </button>
          
          <button 
            onClick={() => setActiveTab('automation')} 
            style={{
              textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', 
              backgroundColor: activeTab === 'automation' ? '#1A1A1A' : 'transparent', 
              color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            🤖 Automatisation (Resend Mail)
          </button>
          
          <button 
            onClick={() => setActiveTab('compta')} 
            style={{
              textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', 
              backgroundColor: activeTab === 'compta' ? '#1A1A1A' : 'transparent', 
              color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            💰 Comptabilité & Retraits
          </button>
        </div>

        {/* Section Partagée / Acheteur */}
        <div style={{ marginTop: '15px', borderTop: '1px solid #1A1A1A', paddingTop: '15px' }}>
          <button 
            onClick={() => setActiveTab('panier')} 
            style={{
              textAlign: 'left', width: '100%', padding: '12px', borderRadius: '8px', 
              backgroundColor: activeTab === 'panier' ? '#1A1A1A' : 'transparent', 
              color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            🛒 Panier Commun & Suivi
          </button>
        </div>
      </nav>

      {/* Footer Boutons de Sessions */}
      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('auth')} 
          style={{ padding: '11px', borderRadius: '6px', backgroundColor: '#1A1A1A', color: '#FFFFFF', border: '1px solid #333333', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
        >
          🔗 Accéder aux Inscriptions
        </button>
        <button 
          onClick={onLogout} 
          style={{ padding: '11px', borderRadius: '6px', backgroundColor: '#A51C2B', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
        >
          🚪 Se Déconnecter
        </button>
      </div>
    </aside>
  );
}
