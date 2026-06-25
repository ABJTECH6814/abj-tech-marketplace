"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export function AutomationSettings({ sellerId }: { sellerId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Tableau de 3 entrées d'emails max
  const [emails, setEmails] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    async function fetchAutomation() {
      const docSnap = await getDoc(doc(db, "sellerProfiles", sellerId));
      if (docSnap.exists() && docSnap.data().automation) {
        const savedEmails = docSnap.data().automation.relanceEmails || [];
        // Remplir jusqu'à 3 éléments pour maintenir la structure du formulaire
        const structure = [savedEmails[0] || "", savedEmails[1] || "", savedEmails[2] || ""];
        setEmails(structure);
      }
    }
    fetchAutomation();
  }, [sellerId]);

  const handleSaveAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Filtrer les entrées vides
    const activeEmails = emails.filter(email => email.trim() !== "");

    try {
      await updateDoc(doc(db, "sellerProfiles", sellerId), {
        "automation.relanceEmails": activeEmails
      });
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la configuration du CRM.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <h3 style={{ margin: "0 0 6px 0", fontWeight: "900" }}>Automatisation des Relances (CRM Resend API)</h3>
      <p style={{ color: "#666666", fontSize: "0.8rem", marginBottom: "20px" }}>Configurez jusqu'à 3 adresses email pour router automatiquement les notifications de paniers abandonnés ou de relances de paiements.</p>

      {success && <div style={{ color: "#00875A", backgroundColor: "#E2FCEF", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", marginBottom: "15px" }}>Flux CRM Resend connecté avec succès !</div>}
      {error && <div style={{ color: "#D72638", backgroundColor: "#FFF0F2", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", marginBottom: "15px" }}>{error}</div>}

      <form onSubmit={handleSaveAutomation} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {emails.map((email, idx) => (
          <div key={idx}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "#666666", marginBottom: "4px" }}>Canal de Notification {idx + 1}</label>
            <input type="email" placeholder="vendeur@exemple.com" value={email} onChange={(e) => {
              const newEmails = [...emails];
              newEmails[idx] = e.target.value;
              setEmails(newEmails);
            }} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ backgroundColor: "#D72638", color: "#FFF", border: "none", padding: "11px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", marginTop: "10px" }}>
          {loading ? "Synchronisation CRM..." : "Activer les Routages Automation"}
        </button>
      </form>
    </div>
  );
}
