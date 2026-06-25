"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  buyerId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ orderId, productId, buyerId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Enregistrement de la notation dans la collection 'reviews'
      await addDoc(collection(db, "reviews"), {
        orderId,
        productId,
        buyerId,
        rating,
        comment,
        images: [], // Peut être lié à Firebase Storage ultérieurement
        createdAt: serverTimestamp()
      });

      // Rappel technique : La modification de l'état du séquestre (escrowStatus) 
      // et le crédit du solde du vendeur sont gérés de manière sécurisée côté serveur 
      // par une Cloud Function déclenchée sur l'écriture de ce document.

      onReviewSubmitted();
    } catch (err) {
      console.error("Erreur lors de la soumission de la notation :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: "900" }}>⭐ Évaluez votre Expérience</h3>
      <p style={{ color: "#666666", fontSize: "0.78rem", margin: "0 0 16px 0" }}>Votre note débloquera de manière irréversible les fonds en séquestre pour le vendeur.</p>

      <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        
        {/* Module des 5 Étoiles Interactives */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", margin: "10px 0" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => setRating(star)}
              style={{
                fontSize: "2rem",
                cursor: "pointer",
                color: star <= (hoveredRating ?? rating) ? "#FFB100" : "#E2E8F0",
                transition: "color 0.1s ease-in-out"
              }}
            >
              ★
            </span>
          ))}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Votre Commentaire</label>
          <textarea
            required
            placeholder="Qualité du produit, conformité, rapidité du livreur..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", fontFamily: "inherit", boxSizing: "border-box", fontSize: "0.85rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#00875A", color: "#FFFFFF", border: "none",
            padding: "11px", borderRadius: "6px", fontWeight: "700",
            fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Traitement..." : "Soumettre & Libérer les Fonds"}
        </button>
      </form>
    </div>
  );
}
