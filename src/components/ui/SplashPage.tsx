"use client";

import React from 'react';

interface SplashPageProps {
  countdown: number;
}

export function SplashPage({ countdown }: SplashPageProps) {
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#FFFFFF', // Fond blanc obligatoire
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box',
      padding: '20px'
    }}>
      {/* 📱 Mockup de Smartphone Noir aux proportions du logo */}
      <div style={{
        width: '260px',
        height: '520px',
        backgroundColor: '#0F0F0F', // Noir profond
        borderRadius: '36px',
        border: '4px solid #1A1A1A',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        marginBottom: '24px'
      }}>
        {/* Encoche (Notch) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          width: '100px',
          height: '18px',
          backgroundColor: '#0F0F0F',
          borderRadius: '0 0 12px 12px',
          zIndex: 2
        }} />

        {/* Écran Interne Blanc */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #E5E5E5'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            color: '#D72638', // Rouge Mokolo
            letterSpacing: '1px'
          }}>
            WELCOME
          </span>
        </div>
      </div>

      {/* 🏷️ Bloc de Marque Textuel (Mêmes dimensions de largeur que le téléphone) */}
      <div style={{ width: '260px', textAlign: 'center' }}>
        <h1 style={{
          color: '#0F0F0F',
          fontSize: '1.8rem',
          fontWeight: '900',
          margin: '0 0 4px 0',
          letterSpacing: '0.5px'
        }}>
          MOKOLO Market
        </h1>
        
        <p style={{
          color: '#D72638',
          fontSize: '0.85rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '0 0 20px 0'
        }}>
          Welcome
        </p>

        {/* Indicateur Chrono */}
        <div style={{
          display: 'inline-block',
          backgroundColor: '#FFF0F2',
          color: '#A51C2B',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '700',
          border: '1px solid #FFF0F2'
        }}>
          Connexion au serveur central dans {countdown}s
        </div>
      </div>
    </div>
  );
}
