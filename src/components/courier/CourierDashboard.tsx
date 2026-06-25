"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface CourierJob {
  id: string;
  orderId: string;
  totalXAF: number;
  shippingAddress: {
    city: string;
    district: string;
    landmark: string;
  };
  courierStatus: string;
}

export function CourierDashboard() {
  const [jobs, setJobs] = useState<CourierJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Écoute active et synchronisation en temps réel avec la file d'attente Firestore
  useEffect(() => {
    const q = query(
      collection(db, "courierQueue"),
      where("courierStatus", "==", "AVAILABLE")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeJobs: CourierJob[] = [];
      snapshot.forEach((doc) => {
        activeJobs.push({ id: doc.id, ...doc.data() } as CourierJob);
      });
      setJobs(activeJobs);
      setLoading(false);
    }, (error) => {
      console.error("Erreur écoute logistique en temps réel:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptJob = async (jobId: string, orderId: string) => {
    try {
      // 1. Verrouiller la course pour ce livreur
      await updateDoc(doc(db, "courierQueue", jobId), {
        courierStatus: "PICKED_UP",
        acceptedAt: serverTimestamp()
      });

      // 2. Mettre à jour le statut global de la commande pour l'acheteur (Étape 5)
      await updateDoc(doc(db, "orders", orderId), {
        status: "SHIPPED",
        courierStartedAt: serverTimestamp()
      });

      alert(`Course acceptée avec succès ! Le statut de la commande #${orderId} est passé à : EXPÉDIÉ.`);
    } catch (err) {
      alert("Erreur lors de la prise en charge de la livraison.");
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "25px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span style={{ fontSize: "1.2rem" }}>🚴</span>
        <h3 style={{ margin: 0, fontWeight: "900", color: "#0F0F0F" }}>Console Logistique en Temps Réel</h3>
      </div>
      <p style={{ color: "#666666", fontSize: "0.8rem", margin: "0 0 20px 0" }}>
        Flux synchronisé avec le serveur central. Acceptez les livraisons dès qu'un paiement mobile est validé.
      </p>

      {loading ? (
        <div style={{ fontSize: "0.85rem", color: "#666666" }}>Connexion au flux logistique...</div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: "30px", border: "2px dashed #E2E8F0", borderRadius: "8px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
          📭 Aucun colis en attente de ramassage pour le moment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#D72638", fontWeight: "800", display: "block" }}>DISPONIBLE IMMÉDIATEMENT</span>
                <strong style={{ fontSize: "0.85rem", display: "block", margin: "2px 0" }}>Commande : #{job.orderId}</strong>
                <span style={{ fontSize: "0.8rem", color: "#475569", display: "block" }}>
                  📍 Destination : {job.shippingAddress.city}, {job.shippingAddress.district} ({job.shippingAddress.landmark})
                </span>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "900", display: "block", marginBottom: "6px" }}>
                  {job.totalXAF.toLocaleString()} XAF
                </span>
                <button
                  type="button"
                  onClick={() => handleAcceptJob(job.id, job.orderId)}
                  style={{ backgroundColor: "#0F0F0F", color: "#FFFFFF", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
                >
                  Prendre en charge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
