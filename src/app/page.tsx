import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f6f9',
      color: '#333',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#0070f3', marginBottom: '10px' }}>
        AbJ Tech Marketplace
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
        Bienvenue sur votre plateforme moderne de marché digital. 
        Le déploiement avec Vercel fonctionne parfaitement !
      </p>
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        Étape 1 : Structure initiale validée. Réalisé par l'agence AbJ Tech.
      </div>
    </div>
  );
}
