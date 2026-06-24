"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnexionPage() {
  const router = useRouter();

  // États pour gérer les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePass: '',
    pays: 'CM', // Cameroun par défaut
    telephone: '',
    nomBoutique: '',
  });

  const [cataloguesSelectionnes, setCataloguesSelectionnes] = useState<string[]>([]);

  // Liste exemple de catalogues (sur les 100 à venir)
  const listeCatalogues = [
    "Mode & Vêtements",
    "Électronique & Smartphones",
    "Chaussures & Accessoires",
    "Beauté & Cosmétiques",
    "Électroménager",
    "Informatique & Accessoires"
  ];

  // Gestion des changements dans les inputs standard
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gestion de la sélection multiple des catalogues
  const handleCatalogueToggle = (catalogue: string) => {
    if (cataloguesSelectionnes.includes(catalogue)) {
      setCataloguesSelectionnes(cataloguesSelectionnes.filter(item => item !== catalogue));
    } else {
      setCataloguesSelectionnes([...cataloguesSelectionnes, catalogue]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici sera connectée la logique Firebase Auth pour créer le vendeur
    alert(`Inscription validée pour la boutique : ${formData.nomBoutique}`);
    router.push('/'); // Redirection vers l'accueil après validation
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff', // FOND BLANC OBLIGATOIRE
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: 'Segoe UI, Roboto, Helvetica, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '550px',
        backgroundColor: '#ffffff',
        border: '2px solid #ffffff', // BORDURES BLANCHES
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', // Ombre légère pour décoller du fond blanc
        boxSizing: 'border-box'
      }}>
        
        {/* Entête du Formulaire */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            Rejoindre MOKOLO Market
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
            Créez votre compte vendeur unique et commencez à publier
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Ligne Nom / Prénom */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom</label>
              <input type="text" name="nom" required value={formData.nom} onChange={handleChange} 
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Prénom</label>
              <input type="text" name="prenom" required value={formData.prenom} onChange={handleChange} 
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Adresse Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} 
              style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Mot de passe</label>
            <input type="password" name="motDePass" required value={formData.motDePass} onChange={handleChange} 
              style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Indicateur de Pays & Téléphone */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Pays</label>
              <select name="pays" value={formData.pays} onChange={handleChange} 
                style={{ width: '100%', padding: '11px 5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }}>
                <option value="CM">🇨🇲 CM</option>
                <option value="CI">🇨🇮 CI</option>
                <option value="SN">🇸🇳 SN</option>
                <option value="GA">🇬🇦 GA</option>
                <option value="FR">🇫🇷 FR</option>
              </select>
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Numéro de téléphone</label>
              <input type="tel" name="telephone" required value={formData.telephone} onChange={handleChange} placeholder="Ex: 6xxxxxx"
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Nom de la boutique */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom de votre Boutique Unique</label>
            <input type="text" name="nomBoutique" required value={formData.nomBoutique} onChange={handleChange} placeholder="Ex: MaVitrineMokolo"
              style={{ width: '100%', padding: '11px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Choix des Catalogues */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
              Sélectionnez vos catalogues (Choix multiples)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
              {listeCatalogues.map((catalogue) => {
                const estSelectionne = cataloguesSelectionnes.includes(catalogue);
                return (
                  <button type="button" key={catalogue} onClick={() => handleCatalogueToggle(catalogue)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      borderRadius: '20px',
                      border: estSelectionne ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      backgroundColor: estSelectionne ? '#fef2f2' : '#ffffff',
                      color: estSelectionne ? '#dc2626' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    {catalogue} {estSelectionne && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BAS DU FORMULAIRE : Actions alignées gauche / droite */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px',
            gap: '10px'
          }}>
            {/* À Gauche : Lien Mot de passe oublié */}
            <a href="#" style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>

            {/* À Droite : Bouton rouge dégradé avec écriture noire */}
            <button type="submit" style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #ff002b 0%, #b9001a 100%)', // Rouge dégradé
              color: '#000000', // Écriture noire
              border: 'none',
              borderRadius: '8px',
              fontWeight: '750',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(185, 0, 26, 0.2)'
            }}>
              Se connecter
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
