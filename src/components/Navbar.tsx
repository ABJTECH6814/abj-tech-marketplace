import React from 'react';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0070f3' }}>
        AbJ Tech Marketplace
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Accueil</a>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Boutique</a>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Mon Panier</a>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Connexion
        </button>
      </div>
    </nav>
  );
}
