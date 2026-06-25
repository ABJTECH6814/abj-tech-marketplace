"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ProductManagerProps {
  sellerId: string;
  sellerSlug: string;
}

export function ProductManager({ sellerId, sellerSlug }: ProductManagerProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formulaire d'ajout
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Téléphones & Électronique");
  
  // Les 3 paliers de prix requis pour le CRM / IA de négociation
  const [prixPublic, setPrixPublic] = useState("");
  const [prixIntermediaire, setPrixIntermediaire] = useState("");
  const [prixPlancher, setPrixPlancher] = useState("");

  // Simulation des fichiers d'images (Exigence stricte : minimum 4 photos)
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", // Image 1 par défaut
    "", "", "" // En attente des 3 autres minimum
  ]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // 1. Validation stricte du nombre de photos (Min 4)
    const validImages = imageUrls.filter(url => url.trim() !== "");
    if (validImages.length < 4) {
      setError("Exigence MOKOLO Market : Vous devez fournir un minimum de 4 photos pour publier cet article.");
      return;
    }

    // 2. Validation cohérente des paliers de prix
    const pPublic = parseFloat(prixPublic);
    const pInter = parseFloat(prixIntermediaire);
    const pPlancher = parseFloat(prixPlancher);

    if (pInter >= pPublic || pPlancher >= pInter) {
      setError("Logique de prix invalide : Le Prix Public doit être supérieur au Prix Intermédiaire, lui-même supérieur au Prix Plancher (Secret).");
      return;
    }

    setLoading(true);

    try {
      // Injection directe dans la collection racine unique 'products'
      await addDoc(collection(db, "products"), {
        sellerId,
        sellerSlug,
        title,
        description,
        category,
        subCategory: "Général",
        images: validImages,
        status: "ACTIVE", // Directement visible sur le marché central
        tags: [category.toLowerCase()],
        // Mapping de la structure de prix dénormalisée pour l'IA
        priceTiers: [
          { minQty: 1, price: pPublic },       // Niveau 1 : Affiché
          { minQty: 5, price: pInter },        // Niveau 2 : Négociation intermédiaire
          { minQty: 10, price: pPlancher }     // Niveau 3 : Seuil critique secret
        ],
        createdAt: serverTimestamp()
      });

      setMessage("Article injecté avec succès sur le serveur central et la page d'accueil !");
      // Reset formulaire
      setTitle("");
      setDescription("");
      setPrixPublic("");
      setPrixIntermediaire("");
      setPrixPlancher("");
    } catch (err) {
      setError("Erreur technique lors de la publication de l'article.");
    } finally {
      setLoading(false);
    }
  };

  // Simuler l'ajout d'une URL de photo pour le MVP
  const simulateImageUpload = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls[index] = `https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=500&sig=${index}`;
    setImageUrls(newUrls);
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <h3 style={{ margin: "0 0 6px 0", fontWeight: "900", color: "#0F0F0F" }}>Ajouter un Article au Marché Central</h3>
      <p style={{ color: "#666666", fontSize: "0.8rem", margin: "0 0 20px 0" }}>
        Remplissez la fiche produit unifiée. Vos stocks seront visibles instantanément sur l'accueil globale.
      </p>

      {error && <div style={{ color: "#D72638", backgroundColor: "#FFF0F2", padding: "12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "15px", border: "1px solid #D72638" }}>{error}</div>}
      {message && <div style={{ color: "#00875A", backgroundColor: "#E2FCEF", padding: "12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "15px", border: "1px solid #00875A" }}>{message}</div>}

      <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "15px" }}>
          <input type="text" placeholder="Nom de l'article" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ flex: 2, padding: "11px", borderRadius: "6px", border: "1px solid #E5E5E5" }} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "1px solid #E5E5E5", backgroundColor: "#FFF", fontWeight: "600" }}>
            <option value="Téléphones & Électronique">Téléphones & Électronique</option>
            <option value="Mode & Vêtements">Mode & Vêtements</option>
          </select>
        </div>

        <textarea placeholder="Description détaillée du produit..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #E5E5E5", fontFamily: "inherit", boxSizing: "border-box" }} />

        {/* 📑 Galerie Obligatoire (Min 4 Photos) */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#0F0F0F", marginBottom: "8px" }}>
            GALERIE PRODUIT (Minimum 4 photos obligatoires)
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {imageUrls.map((url, idx) => (
              <div key={idx} onClick={() => simulateImageUpload(idx)} style={{
                width: '75px', height: '75px', border: url ? '2px solid #D72638' : '2px dashed #CBD5E1',
                borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', cursor: 'pointer', backgroundColor: url ? '#FFF' : '#F8FAFC', overflow: 'hidden'
              }}>
                {url ? (
                  <img src={url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}>+</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🤖 Les 3 Paliers de Prix (CRM Négociation) */}
        <div style={{ backgroundColor: "#F9F9F9", padding: "18px", borderRadius: "8px", border: "1px solid #E5E5E5" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#0F0F0F", display: "block", marginBottom: "12px", letterSpacing: "0.5px" }}>
            🤖 CONFIGURATION DU CRM DE TARIFICATION (PALIERS DE NÉGOCIATION IA)
          </span>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#666666" }}>1. Prix Public (Affiché)</label>
              <input type="number" placeholder="XAF" value={prixPublic} onChange={(e) => setPrixPublic(e.target.value)} required style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#666666" }}>2. Prix Intermédiaire</label>
              <input type="number" placeholder="XAF" value={prixIntermediaire} onChange={(e) => setPrixIntermediaire(e.target.value)} required style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#666666" }}>3. Prix Plancher (Secret)</label>
              <input type="number" placeholder="XAF" value={prixPlancher} onChange={(e) => setPrixPlancher(e.target.value)} required style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: "#D72638", color: "#FFF", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "700", fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Injection en cours..." : "Publier sur le Marché Central"}
        </button>
      </form>
    </div>
  );
}
