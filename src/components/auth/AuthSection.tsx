"use client";

import React, { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthSectionProps {
  onAuthSuccess: (uid: string, isSeller: boolean) => void;
}

export function AuthSection({ onAuthSuccess }: AuthSectionProps) {
  // Modes d'affichage : 'LOGIN' (Client/Acheteur) ou 'REGISTER_SELLER' (Vendeur)
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER_SELLER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Champs Communs & Spécifiques
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");

  // Handler 1 : Connexion Simple (Acheteur)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // En production, nous irons lire le document /users/uid pour savoir s'il est vendeur
      onAuthSuccess(userCredential.user.uid, false);
    } catch (err: any) {
      setError("Identifiants invalides ou problème de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Handler 2 : Inscription Complète (Vendeur)
  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !shopName) {
      setError("Veuillez remplir tous les champs requis pour créer votre boutique.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Création du compte dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Création du document d'utilisateur centralisé (/users/{uid})
      await setDoc(doc(db, "users", uid), {
        email,
        phone,
        firstName,
        lastName,
        role: "SELLER",
        isSeller: true,
        isVerified: false,
        kycStatus: "NONE",
        createdAt: serverTimestamp(),
      });

      // 3. Initialisation du profil de la boutique unique (/sellerProfiles/{uid})
      const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      await setDoc(doc(db, "sellerProfiles", uid), {
        shopName,
        shopSlug,
        description: `Bienvenue chez ${shopName}`,
        logoUrl: "",
        bannerUrl: "",
        type: "B2C",
        balance: 0,
        totalEarned: 0,
        automation: {
          relanceEmails: [] // Max 3 pour l'intégration de l'API Resend
        },
        analytics: {
          fbPixelId: "",
          tiktokPixelId: "",
          gtmId: ""
        },
        createdAt: serverTimestamp(),
      });

      setMessage("Votre espace vendeur a été initialisé avec succès !");
      onAuthSuccess(uid, true);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà associée à un compte.");
      } else {
        setError("Erreur lors de la création du compte vendeur.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler 3 : Option de récupération de Mot de Passe Oublié
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email dans le champ ci-dessus.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Un email de réinitialisation de mot de passe vous a été envoyé.");
      setError(null);
    } catch (err) {
      setError("Impossible d'envoyer l'email de récupération.");
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E5E5',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* En-tête dynamique du formulaire */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F0F0F' }}>
          {mode === 'LOGIN' ? 'Accès Client Rapide' : 'Inscription Espace Vendeur'}
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: '1.4' }}>
          {mode === 'LOGIN' 
            ? 'Connectez-vous pour suivre votre panier et valider vos commandes.' 
            : 'Créez votre boutique sur le serveur central de Mokolo Market.'}
        </p>
      </div>

      {/* Alertes et Notifications */}
      {error && <div style={{ color: '#D72638', backgroundColor: '#FFF0F2', border: '1px solid #D72638', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '15px' }}>{error}</div>}
      {message && <div style={{ color: '#00875A', backgroundColor: '#E2FCEF', border: '1px solid #00875A', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '15px' }}>{message}</div>}

      <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegisterSeller} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Champs Inscription Vendeur Uniquement */}
        {mode === 'REGISTER_SELLER' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Nom" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: '50%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem' }} 
            />
            <input 
              type="text" 
              placeholder="Prénom" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: '50%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem' }} 
            />
          </div>
        )}

        {mode === 'REGISTER_SELLER' && (
          <input 
            type="tel" 
            placeholder="Numéro de Téléphone (Ex: 6XXXXXXXX)" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem', boxSizing: 'border-box' }} 
          />
        )}

        {mode === 'REGISTER_SELLER' && (
          <input 
            type="text" 
            placeholder="Nom de votre Boutique / Entreprise" 
            value={shopName} 
            onChange={(e) => setShopName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem', boxSizing: 'border-box' }} 
          />
        )}

        {/* Champs Communs (Email & Mot de passe) */}
        <input 
          type="email" 
          placeholder="Adresse Email officielle" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem', boxSizing: 'border-box' }} 
        />

        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '0.85rem', boxSizing: 'border-box' }} 
        />

        {/* Options Complémentaires */}
        {mode === 'LOGIN' && (
          <button 
            type="button" 
            onClick={handleForgotPassword}
            style={{ background: 'none', border: 'none', color: '#666666', fontSize: '0.75rem', textAlign: 'right', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            Mot de passe oublié ?
          </button>
        )}

        {/* Bouton d'Action Principal Soumission */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#666666' : '#0F0F0F',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Traitement en cours...' : mode === 'LOGIN' ? 'Se Connecter' : 'Finaliser mon Inscription Vendeur'}
        </button>
      </form>

      {/* Bascule Asymétrique entre les modes */}
      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #E5E5E5', textAlign: 'center' }}>
        {mode === 'LOGIN' ? (
          <div>
            <span style={{ fontSize: '0.8rem', color: '#666666' }}>Vous souhaitez vendre sur la plateforme ?</span>
            <button 
              type="button" 
              onClick={() => { setMode('REGISTER_SELLER'); setError(null); setMessage(null); }}
              style={{ display: 'block', width: '100%', marginTop: '8px', backgroundColor: '#D72638', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Créer un Compte Vendeur
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => { setMode('LOGIN'); setError(null); setMessage(null); }}
            style={{ background: 'none', border: 'none', color: '#0F0F0F', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Retourner à la connexion client simple
          </button>
        )}
      </div>
    </div>
  );
}
