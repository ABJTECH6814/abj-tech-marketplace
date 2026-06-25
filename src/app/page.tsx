"use client";

import React from 'react';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* --- EN-TÊTE HÉROS BIENVENUE --- */}
      <header style={{
        background: 'linear-gradient(135deg, #ff002b 0%, #b9001a 100%)',
        color: '#ffffff',
        padding: '60px 4%',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
          Réseau Omnicanal Multi-Boutiques
        </span>
        
        {/* LA LIGNE CORRIGÉE EST ICI : marginBottom au lieu de marginBoton */}
        <h1 style={{ fontSize: 'calc(1.8rem + 1.2vw)', fontWeight: '800', marginTop: '15px', marginBottom: '15px', lineHeight: '1.2' }}>
          Votre Boutique Unique au Cœur du Grand Marché
        </h1>
        
        <p style={{ fontSize: 'calc(0.95rem + 0.1vw)', color: '#fca5a5', marginBottom: '25px', lineHeight: '1.5' }}>
          Rejoignez la plateforme MOKOLO Market et propulsez vos ventes.
        </p>
      </header>

      {/* --- FLUX DE PRODUITS EN DOUBLE COLONNE --- */}
      <main style={{ padding: '25px 4%' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#1e293b', textTransform: 'uppercase' }}>
          🔥 Flux du Marché Central
        </h2>
        {/* Le reste de tes produits va ici... */}
      </main>

    </div>
  );
}
