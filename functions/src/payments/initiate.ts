import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

// Initialisation de l'application Admin si ce n'est pas déjà fait
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const initiateMobilePayment = functions.https.onCall(async (data, context) => {
  // 1. Protection : L'utilisateur doit être authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non connecté.");
  }

  const uid = context.auth.uid;
  const { cartItems, shippingAddress, paymentMethod, phoneNumber } = data;

  if (!cartItems || cartItems.length === 0 || !phoneNumber) {
    throw new functions.https.HttpsError("invalid-argument", "Données de panier ou numéro manquants.");
  }

  try {
    // 2. Calcul strict du montant total en consultant les prix réels dans Firestore (Anti-fraude)
    let totalXAF = 0;
    const itemsToCreate = [];

    for (const item of cartItems) {
      const productSnap = await db.collection("products").doc(item.id).get();
      if (!productSnap.exists) throw new Error(`Produit introuvable: ${item.id}`);
      
      const productData = productSnap.data();
      // On extrait le prix public affiché (Palier 1 codé à l'étape 4)
      const exactPrice = productData?.priceTiers[0]?.price || 0;
      
      totalXAF += exactPrice * item.quantity;

      // Calcul prévisionnel de la commission ABJ Tech (Ex: 5%)
      const commissionRate = 0.05;
      const commissionXAF = Math.round(exactPrice * item.quantity * commissionRate);
      const sellerAmount = (exactPrice * item.quantity) - commissionXAF;

      itemsToCreate.push({
        productId: item.id,
        sellerId: productData?.sellerId,
        quantity: item.quantity,
        unitPrice: exactPrice,
        commissionRate,
        commissionXAF,
        sellerAmount
      });
    }

    // 3. Génération d'une référence unique de transaction pour MTN / Orange Money
    const paymentRef = `MOKOLO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Création de la commande à l'état PENDING dans Firestore
    const orderRef = await db.collection("orders").add({
      buyerId: uid,
      status: "PENDING",
      totalXAF,
      shippingAddress,
      paymentMethod,
      paymentRef,
      escrowStatus: "HELD", // Bloqué par défaut tant que le paiement n'est pas "SUCCESS"
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Enregistrement des sous-éléments de commande
    for (const item of itemsToCreate) {
      await db.collection("orderItems").add({
        orderId: orderRef.id,
        ...item
      });
    }

    // 6. Appel de l'API de l'opérateur (Simulé ici pour MTN MoMo / Orange Money / PayDunya)
    // En production, vous remplacez cette section par le endpoint de votre agrégateur
    /*
    const response = await axios.post("https://api.paydunya.com/v1/push-stk", {
      amount: totalXAF,
      phone: phoneNumber,
      method: paymentMethod,
      reference: paymentRef,
      callback_url: "https://votre-region-projet.cloudfunctions.net/paymentWebhook"
    });
    */

    return { success: true, orderId: orderRef.id, paymentRef };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
