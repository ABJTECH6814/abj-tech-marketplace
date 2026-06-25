"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export function AnalyticsSettings({ sellerId }: { sellerId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fbPixelId, setFbPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [gtmId, setGtmId] = useState("");

  useEffect(() => {
    async function fetchPixels() {
      const docSnap = await getDoc(doc(db, "sellerProfiles", sellerId));
      if (docSnap.exists() && docSnap.data().analytics) {
        const data = docSnap.data().analytics;
        setFbPixelId(data.fbPixelId || "");
        setTiktokPixelId(data.tiktokPixelId || "");
        setGtmId(data.gtmId || "");
      }
    }
    fetchPixels();
  }, [sellerId]);

  const handleSaveAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, "sellerProfiles", sellerId), {
        "analytics.fbPixelId": fbPixelId,
        "analytics.tiktokPixelId": tiktokPixelId,
        "analytics.gtmId": gtmId
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "12px", border: "1px solid #E5E5E5", fontFamily: "Inter, sans-serif" }}>
      <h3 style={{ margin: "0 0 6px 0", fontWeight: "900" }}>Traqueurs Publicitaires & Analytics</h3>
      <p style={{ color: "#666666", fontSize: "0.8rem", marginBottom: "20px" }}>Injectez vos ID de suivi pour que vos fiches produits déclenchent automatiquement vos événements de conversion.</p>

      {success && <div style={{ color: "#00875A", backgroundColor: "#E2FCEF", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", marginBottom: "15px" }}>Pixels configurés et synchronisés !</div>}

      <form onSubmit={handleSaveAnalytics} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "4px" }}>ID Pixel Facebook</label>
          <input type="text" value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)} placeholder="Ex: 123456789012345" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "4px" }}>ID Pixel TikTok</label>
          <input type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="Ex: C1234567890ABC" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "4px" }}>Google Tag Manager (GTM)</label>
          <input type="text" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #E5E5E5", boxSizing: "border-box" }} />
        </div>
        <button type="submit" disabled={loading} style={{ backgroundColor: "#0F0F0F", color: "#FFF", border: "none", padding: "11px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", marginTop: "5px" }}>
          {loading ? "Mise à jour..." : "Sauvegarder les Traqueurs"}
        </button>
      </form>
    </div>
  );
}
