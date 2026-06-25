"use client";

import React from 'react';

interface PhoneMockupProps {
  screenText: string;
}

export function PhoneMockup({ screenText }: PhoneMockupProps) {
  return (
    <div style={{
      width: '280px',
      height: '560px',
      backgroundColor: '#0F0F0F', // Noir Profond du Design System
      borderRadius: '40px',
      border: '4px solid #1A1A1A', // Finition noire douce
      position: 'relative',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px',
      boxSizing: 'border-box'
    }}>
      {/* Encoche supérieure (Notch) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        width: '120px',
        height: '20px',
        backgroundColor: '#0F0F0F',
        borderRadius: '0 0 15px 15px',
        zIndex: 10
      }} />

      {/* Écran Interne du Smartphone */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF', // Fond blanc exigé
        borderRadius: '32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        border: '1px solid #E5E5E5'
      }}>
        {/* Contenu de l'écran simulé */}
        <div style={{
          background: 'linear-gradient(135deg, #D72638 0%, #A51C2B 100%)', // Rouge Mokolo
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: '900',
          fontSize: '1.2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(215, 38, 56, 0.2)',
          marginBottom: '10px'
        }}>
          MOKOLO
        </div>
        <div style={{ color: '#0F0F0F', fontWeight: '800', fontSize: '1rem', letterSpacing: '0.5px' }}>
          MARKET
        </div>
        <div style={{ color: '#666666', fontSize: '0.8rem', marginTop: '15px', fontWeight: '600' }}>
          {screenText}
        </div>
      </div>

      {/* Bouton Home virtuel inférieur */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        width: '40px',
        height: '4px',
        backgroundColor: '#666666',
        borderRadius: '2px'
      }} />
    </div>
  );
}
