import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const adminProcessWithdrawal = functions.https.onCall(async (data, context) => {
  // Barrière de Sécurité Admin
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Non connecté.");
  }
  const adminUserDoc = await db.collection("users").doc(context.auth.uid).get();
  if (adminUserDoc.data()?.role !== "ADMIN") {
    throw new functions.https.HttpsError("permission-denied", "Action interdite.");
  }

  const { withdrawalId, action } = data; // action peut être "APPROVE" (devient PAID) ou "REJECT" (devient REJECTED)
  if (!withdrawalId || !["APPROVE", "REJECT"].includes(action)) {
    throw new functions.https.HttpsError("invalid-argument", "Action invalide.");
  }

  try {
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    
    await db.runTransaction(async (transaction) => {
      const withdrawalSnap = await transaction.get(withdrawalRef);
      if (!withdrawalSnap.exists) throw new Error("Demande de retrait introuvable.");
      
      const wData = withdrawalSnap.data();
      if (wData?.status !== "PENDING") throw new Error("Cette demande a déjà été traitée.");

      const sellerProfileRef = db.collection("sellerProfiles").doc(wData.sellerId);
      const sellerProfileSnap = await transaction.get(sellerProfileRef);

      if (!sellerProfileSnap.exists) throw new Error("Profil vendeur introuvable.");
      const currentBalance = sellerProfileSnap.data()?.balance || 0;

      if (action === "APPROVE") {
        // Validation stricte : Le vendeur a-t-il toujours l'argent disponible ?
        if (currentBalance < wData.amount) {
          throw new Error("Solde insuffisant chez le vendeur pour honorer ce retrait.");
        }

        // Déduction du solde de la boutique
        transaction.update(sellerProfileRef, {
          balance: currentBalance - wData.amount
        });
        
        // Passage au statut final PAID (Prêt pour le transfert MTN/Orange)
        transaction.update(withdrawalRef, {
          status: "PAID",
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Rejet de la demande, l'argent reste sur son solde
        transaction.update(withdrawalRef, {
          status: "REJECTED",
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    return { success: true, message: `Retrait mis à jour avec le statut : ${action === "APPROVE" ? "PAID" : "REJECTED"}` };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
