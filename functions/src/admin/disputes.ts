import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const adminResolveDispute = functions.https.onCall(async (data, context) => {
  // 1. Barrière de Sécurité : Vérification stricte du rôle ADMIN
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Session expirée ou non connectée.");
  }

  const adminUid = context.auth.uid;
  const adminUserDoc = await db.collection("users").doc(adminUid).get();
  
  if (!adminUserDoc.exists || adminUserDoc.data()?.role !== "ADMIN") {
    throw new functions.https.HttpsError("permission-denied", "Accès refusé. Cette action est réservée à l'administrateur ABJ Tech.");
  }

  const { orderId, decision } = data; // decision peut être "RELEASE_TO_SELLER" ou "REFUND_TO_BUYER"
  if (!orderId || !["RELEASE_TO_SELLER", "REFUND_TO_BUYER"].includes(decision)) {
    throw new functions.https.HttpsError("invalid-argument", "Paramètres de décision invalides.");
  }

  try {
    const orderRef = db.collection("orders").doc(orderId);
    
    await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) throw new Error("Commande introuvable.");
      
      const orderData = orderSnap.data();
      if (orderData?.escrowStatus !== "HELD") {
        throw new Error("Le séquestre de cette commande n'est pas bloqué (HELD). Arbitrage impossible.");
      }

      const itemsSnapshot = await db.collection("orderItems").where("orderId", "==", orderId).get();

      if (decision === "RELEASE_TO_SELLER") {
        // Option A : L'admin donne raison au vendeur (Libération des fonds)
        for (const itemDoc of itemsSnapshot.docs) {
          const itemData = itemDoc.data();
          const sellerProfileRef = db.collection("sellerProfiles").doc(itemData.sellerId);
          const sellerProfileSnap = await transaction.get(sellerProfileRef);

          if (sellerProfileSnap.exists) {
            const currentBalance = sellerProfileSnap.data()?.balance || 0;
            const currentTotalEarned = sellerProfileSnap.data()?.totalEarned || 0;
            
            transaction.update(sellerProfileRef, {
              balance: currentBalance + itemData.sellerAmount,
              totalEarned: currentTotalEarned + itemData.sellerAmount
            });
          }
        }
        transaction.update(orderRef, { escrowStatus: "RELEASED", status: "DELIVERED" });

      } else if (decision === "REFUND_TO_BUYER") {
        // Option B : L'admin donne raison à l'acheteur (Remboursement programmé)
        // Les fonds restent sur le compte central d'ABJ Tech pour être réémis vers l'acheteur via Mobile Money
        transaction.update(orderRef, { escrowStatus: "REFUNDED", status: "CANCELLED" });
      }
    });

    return { success: true, message: `Litige résolu avec succès. Décision : ${decision}` };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
