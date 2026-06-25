import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const releaseEscrowOnReview = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snapshot) => {
    const reviewData = snapshot.data();
    const orderId = reviewData.orderId;

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) return;
      const orderData = orderSnap.data();

      // Règle de sécurité stricte : On ne libère l'argent que s'il est actuellement gelé (HELD)
      if (orderData?.escrowStatus !== "HELD") {
        console.log(`Le séquestre pour la commande ${orderId} a déjà un statut : ${orderData?.escrowStatus}`);
        return;
      }

      // 1. Extraction de la ventilation financière de chaque article lié à cette commande
      const itemsSnapshot = await db.collection("orderItems").where("orderId", "==", orderId).get();

      // Utilisation d'un système de Transaction Firestore pour éviter les conflits d'écriture simultanés
      await db.runTransaction(async (transaction) => {
        
        for (const itemDoc of itemsSnapshot.docs) {
          const itemData = itemDoc.data();
          const sellerId = itemData.sellerId;
          const netSellerAmount = itemData.sellerAmount; // Montant calculé après déduction de la commission

          const sellerProfileRef = db.collection("sellerProfiles").doc(sellerId);
          const sellerProfileSnap = await transaction.get(sellerProfileRef);

          if (sellerProfileSnap.exists) {
            const currentBalance = sellerProfileSnap.data()?.balance || 0;
            const currentTotalEarned = sellerProfileSnap.data()?.totalEarned || 0;

            // Créditer le solde disponible pour les retraits du vendeur
            transaction.update(sellerProfileRef, {
              balance: currentBalance + netSellerAmount,
              totalEarned: currentTotalEarned + netSellerAmount
            });
          }
        }

        // 2. Clôture irréversible de l'état de la commande et du séquestre
        transaction.update(orderRef, {
          status: "DELIVERED",
          escrowStatus: "RELEASED", // Libération validée
          reviewedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      console.log(`Séquestre liquidé avec succès pour la commande : ${orderId}. Vendeurs crédités.`);
    } catch (error) {
      console.error("Échec de la libération automatique du séquestre :", error);
    }
  });
