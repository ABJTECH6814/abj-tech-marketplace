"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

interface PendingWithdrawal {
  id: string;
  sellerId: string;
  name: string;
  phone: string;
  amount: number;
  status: string;
}

export function AdminDashboard() {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Chargement des requêtes financières PENDING
  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "withdrawals"), where("status", "==", "PENDING"));
      const querySnapshot = await getDocs(q);
      const list: PendingWithdrawal[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PendingWithdrawal);
      });
      setWithdrawals(list);
    } catch (err) {
      console.error("Erreur de droits ou de lecture :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleProcessWithdrawal = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    try {
      const functions = getFunctions();
      const processFn = httpsCallable(functions, "adminProcessWithdrawal");
      await processFn({ withdrawalId: id, action });
      alert(`Opération validée. Le statut a été mis à jour.`);
      fetchPendingPayments(); // Rechargement du tableau
    } catch (err: any) {
      alert(`Erreur d'arbitrage : ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <div style={{ borderBottom: "2px solid #D72638", paddingBottom: "10px", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#0F0F0F", fontWeight: "900", fontSize: "1.3rem" }}>🛡️ Console Super-Admin (ABJ Tech Core)</h2>
        <span style={{ fontSize: "0.75rem", color: "#666666", fontWeight: "700" }}>GESTION DU SÉQUESTRE CENTRAL & DES RETRAITS CAMEROUN</span>
      </div>

      <h4 style={{ margin: "0 0 12px 0", fontWeight: "800" }}>💸 Demandes de retraits Mobile Money en attente</h4>
      
      {loading ? (
        <div style={{ fontSize: "0.85rem", color: "#666666" }}>Contrôle des écritures en cours...</div>
      ) : withdrawals.length === 0 ? (
        <div style={{ padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "6px", textAlign: "center", color: "#64748B", fontSize: "0.85rem", border: "1px solid #E2E8F0" }}>
          ✅ Aucun ordre de retrait en attente. Toutes les balances sont synchronisées.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {withdrawals.map((w) => (
            <div key={w.id} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #E2E8F0", backgroundColor: "#FFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "0.9rem", display: "block", color: "#0F0F0F" }}>{w.name}</strong>
                <span style={{ fontSize: "0.78rem", color: "#666666", display: "block", marginTop: "2px" }}>
                  📱 Compte de Réception : <strong>{w.phone}</strong>
                </span>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>ID : {w.id}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ fontSize: "1rem", fontWeight: "900", color: "#D72638" }}>
                  {w.amount.toLocaleString()} XAF
                </span>
                
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleProcessWithdrawal(w.id, "APPROVE")}
                    style={{ backgroundColor: "#00875A", color: "#FFF", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    {actionLoading === w.id ? "..." : "Valider Virement"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleProcessWithdrawal(w.id, "REJECT")}
                    style={{ backgroundColor: "#D72638", color: "#FFF", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
