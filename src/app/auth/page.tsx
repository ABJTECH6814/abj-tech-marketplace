"use client";

import React, { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type AuthMode = "LOGIN" | "REGISTER_SELLER";

interface AuthSectionProps {
  onAuthSuccess: (uid: string, isSeller: boolean) => void;
  initialMode?: AuthMode;
}

export function AuthSection({ onAuthSuccess, initialMode = "LOGIN" }: AuthSectionProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onAuthSuccess(userCredential.user.uid, false);
    } catch {
      setError("Identifiants invalides ou problème de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !shopName) {
      setError("Veuillez remplir tous les champs requis pour créer votre boutique.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

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

      const shopSlug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      await setDoc(doc(db, "sellerProfiles", uid), {
        shopName,
        shopSlug,
        description: `Bienvenue chez ${shopName}`,
        logoUrl: "",
        bannerUrl: "",
        type: "B2C",
        balance: 0,
        totalEarned: 0,
        customDomain: "",
        automation: {
          relanceEmails: [],
        },
        analytics: {
          fbPixelId: "",
          tiktokPixelId: "",
          gtmId: "",
        },
        createdAt: serverTimestamp(),
      });

      setMessage("Votre espace vendeur a été initialisé avec succès !");
      onAuthSuccess(uid, true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà associée à un compte.");
      } else {
        setError("Erreur lors de la création du compte vendeur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email dans le champ ci-dessus.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Un email de réinitialisation de mot de passe vous a été envoyé.");
      setError(null);
    } catch {
      setError("Impossible d'envoyer l'email de récupération.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E5E5E5",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #E5E5E5", paddingBottom: "12px" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0F0F0F" }}>
          {mode === "LOGIN" ? "Accès Client Rapide" : "Inscription Espace Vendeur"}
        </h3>
        <p style={{ fontSize: "0.78rem", color: "#666666", margin: 0, lineHeight: 1.4 }}>
          {mode === "LOGIN"
            ? "Connectez-vous pour suivre votre panier et valider vos commandes."
            : "Créez votre boutique sur le serveur central de Mokolo Market."}
        </p>
      </div>

      {error && (
        <div style={{ color: "#D72638", backgroundColor: "#FFF0F2", border: "1px solid #D72638", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, marginBottom: "15px" }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ color: "#00875A", backgroundColor: "#E2FCEF", border: "1px solid #00875A", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, marginBottom: "15px" }}>
          {message}
        </div>
      )}

      <form onSubmit={mode === "LOGIN" ? handleLogin : handleRegisterSeller} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {mode === "REGISTER_SELLER" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: "50%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem" }} />
            <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "50%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem" }} />
          </div>
        )}

        {mode === "REGISTER_SELLER" && (
          <input type="tel" placeholder="Numéro de Téléphone (Ex: 6XXXXXXXX)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem", boxSizing: "border-box" }} />
        )}

        {mode === "REGISTER_SELLER" && (
          <input type="text" placeholder="Nom de votre Boutique / Entreprise" value={shopName} onChange={(e) => setShopName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem", boxSizing: "border-box" }} />
        )}

        <input type="email" placeholder="Adresse Email officielle" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem", boxSizing: "border-box" }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontSize: "0.85rem", boxSizing: "border-box" }} />

        {mode === "LOGIN" && (
          <button type="button" onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "#666666", fontSize: "0.75rem", textAlign: "right", fontWeight: 600, cursor: "pointer", padding: 0 }}>
            Mot de passe oublié ?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#666666" : "#0F0F0F",
            color: "#FFFFFF",
            border: "none",
            padding: "12px",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Traitement en cours..." : mode === "LOGIN" ? "Se Connecter" : "Finaliser mon Inscription Vendeur"}
        </button>
      </form>

      <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #E5E5E5", textAlign: "center" }}>
        {mode === "LOGIN" ? (
          <div>
            <span style={{ fontSize: "0.8rem", color: "#666666" }}>Vous souhaitez vendre sur la plateforme ?</span>
            <button
              type="button"
              onClick={() => { setMode("REGISTER_SELLER"); setError(null); setMessage(null); }}
              style={{ display: "block", width: "100%", marginTop: "8px", backgroundColor: "#D72638", color: "#FFFFFF", border: "none", padding: "10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
            >
              Créer un Compte Vendeur
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setMode("LOGIN"); setError(null); setMessage(null); }}
            style={{ background: "none", border: "none", color: "#0F0F0F", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Retourner à la connexion client simple
          </button>
        )}
      </div>
    </div>
  );
}
