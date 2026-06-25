"use client";

import React from "react";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sellerId: string;
}

interface CartSectionProps {
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  loading: boolean;
}

export function CartSection({ cartItems, onRemoveItem, onCheckout, loading }: CartSectionProps) {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <h3 style={{ margin: "0 0 4px 0", fontWeight: "900", color: "#0F0F0F" }}>🛒 Votre Panier Commun</h3>
      <p style={{ color: "#666666", fontSize: "0.8rem", margin: "0 0 20px 0" }}>Articles centralisés prêts pour la sécurisation par séquestre.</p>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: "0.9rem" }}>
          Votre panier est actuellement vide.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "0.88rem", fontWeight: "700" }}>{item.title}</h4>
                <span style={{ fontSize: "0.75rem", color: "#666666" }}>Quantité : {item.quantity} × {item.price.toLocaleString()} XAF</span>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "end", gap: "4px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "#0F0F0F" }}>{(item.price * item.quantity).toLocaleString()} XAF</span>
                <button type="button" onClick={() => onRemoveItem(item.id)} style={{ background: "none", border: "none", color: "#D72638", fontSize: "0.72rem", fontWeight: "600", cursor: "pointer", padding: 0 }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {/* Synthèse Financière */}
          <div style={{ borderTop: "2px solid #0F0F0F", paddingTop: "14px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800" }}>TOTAL À PAYER :</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#D72638" }}>{totalAmount.toLocaleString()} XAF</span>
          </div>

          <button 
            type="button" 
            onClick={onCheckout}
            disabled={loading}
            style={{
              width: "100%", backgroundColor: loading ? "#666666" : "#0F0F0F", color: "#FFFFFF",
              border: "none", padding: "13px", borderRadius: "6px", fontWeight: "700",
              fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px"
            }}
          >
            {loading ? "Traitement de la commande..." : "Procéder au Paiement Sécurisé"}
          </button>
        </div>
      )}
    </div>
  );
}
