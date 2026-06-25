import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const paymentWebhook = functions.https.onRequest(async (req, res) => {
  // Extraction des données renvoyées par l'opérateur mobile
  const { reference, status, providerRef } = req.body; 

  try {
    // 1. Recherche de la commande associée via la référence unique de paiement
    const orderQuery = await db.collection("orders").where("paymentRef", "==", reference).limit(1).get();

    if (orderQuery.empty) {
      res.status(404).send("Commande introuvable pour cette référence.");
      return;
    }

    const orderDoc = orderQuery.docs[0];
    const orderId = orderDoc.id;

    // 2. Journalisation du paiement reçu dans la collection 'payments'
    await db.collection("payments").add({
      orderId,
      provider: orderDoc.data().paymentMethod,
      amount: orderDoc.data().totalXAF,
      status: status === "SUCCESS" ? "SUCCESS" : "FAILED",
      providerRef: providerRef || "N/A",
      webhookData: req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Si le paiement mobile est un succès complet
    if (status === "SUCCESS") {
      // On met à jour la commande : Validée, et argent officiellement sous séquestre HELD
      await db.collection("orders").doc(orderId).update({
        status: "CONFIRMED", // Devient visible par l'interface du livreur
        escrowStatus: "HELD"  // Séquestre actif, fonds gelés sur le compte central d'ABJ Tech
      });
    } else {
      await db.collection("orders").doc(orderId).update({
        status: "CANCELLED"
      });
    }

    res.status(200).send("Webhook Mokolo Market traité avec succès.");
  } catch (error) {
    console.error("Erreur Webhook:", error);
    res.status(500).send("Erreur interne du serveur central.");
  }
});
