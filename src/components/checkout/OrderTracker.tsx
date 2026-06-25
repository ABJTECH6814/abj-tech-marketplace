"use client";

import React from "react";

interface OrderTrackerProps {
  orderId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "CANCELLED";
  escrowStatus: "HELD" | "RELEASED" | "REFUNDED";
  totalXAF: number;
  onOpenReviewForm: () => void;
}

export function OrderTracker({ orderId, status, escrowStatus, totalXAF, onOpenReviewForm }: OrderTrackerProps) {
  // Styles dynamiques pour les badges de séquestre
  const escrowStyles = {
    HELD: { text: "🔒 FONDS SÉQUESTRÉS (Bloqués sur Mokolo Market)", color: "#A51C2B", bg: "#FFF0F2", border: "#F87171" },
    RELEASED: { text: "🔓 FONDS LIBÉRÉS (Transférés au vendeur)", color: "#00875A", bg: "#E2FCEF", border: "#34D399" },
    REFUNDED: { text: "↩️ COMMANDE REMBOURSÉE", color: "#2563EB", bg: "#EFF6FF", border: "#60A5FA" }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", borderBottom: "1px solid #E5E5E5", paddingBottom: "12px", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "#666666", fontWeight: "600" }}>ID COMMANDE : {orderId}</span>
          <h4 style={{ margin: "4px 0 0 0", fontSize: "1rem", fontWeight: "800" }}>Suivi de Livraison & Garanties</h4>
        </div>
        <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "#0F0F0F" }}>{totalXAF.toLocaleString()} XAF</span>
      </div>

      {/* 🛡️ Alerte Statut du Séquestre */}
      <div style={{
        backgroundColor: escrowStyles[escrowStatus].bg, color: escrowStyles[escrowStatus].color,
        border: `1px solid ${escrowStyles[escrowStatus].border}`, padding: "12px", borderRadius: "6px",
        fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px"
      }}>
        {escrowStyles[escrowStatus].text}
      </div>

      {/* Barre de Progression Logistique */}
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "25px", padding: "0 10px" }}>
        {["En attente", "Expédié", "Livré"].map((label, idx) => {
          const isActive = (idx === 0 && ["PENDING", "CONFIRMED"].includes(status)) ||
                           (idx === 1 && status === "SHIPPED") ||
                           (idx === 2 && ["DELIVERED", "DISPUTED"].includes(status));
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                backgroundColor: isActive ? "#D72638" : "#E2E8F0",
                color: isActive ? "#FFFFFF" : "#64748B", display: "flex",
                justifyContent: "center", alignItems: "center", fontSize: "0.75rem", fontWeight: "700"
              }}>{idx + 1}</div>
              <span style={{ fontSize: "0.75rem", marginTop: "6px", fontWeight: isActive ? "700" : "500", color: isActive ? "#0F0F0F" : "#64748B" }}>{label}</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: "11px", left: "30px", right: "30px", height: "2px", backgroundColor: "#E2E8F0", zIndex: 0 }} />
      </div>

      {/* Action de Validation finale du Client */}
      {status === "SHIPPED" && escrowStatus === "HELD" && (
        <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#334155", lineHeight: "1.4" }}>
            Avez-vous bien reçu votre colis de la part du livreur ? Validez la réception et laissez un avis pour clôturer le séquestre.
          </p>
          <button type="button" onClick={onOpenReviewForm} style={{ backgroundColor: "#00875A", color: "#FFFFFF", border: "none", padding: "10px 18px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>
            Confirmer la Réception & Noter (5★)
          </button>
        </div>
      )}
    </div>
  );
}
