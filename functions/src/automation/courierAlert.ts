import * as functions from "functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const assignCourierAlert = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const nextData = change.after.data();
    const prevData = change.before.data();
    const orderId = context.params.orderId;

    if (prevData.status === "PENDING" && nextData.status === "CONFIRMED") {
      // Injection automatique de la feuille de route logistique dans une file d'attente
      await db.collection("courierQueue").add({
        orderId,
        shippingAddress: nextData.shippingAddress,
        totalXAF: nextData.totalXAF,
        courierStatus: "AVAILABLE", // Prêt à être intercepté en temps réel
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
