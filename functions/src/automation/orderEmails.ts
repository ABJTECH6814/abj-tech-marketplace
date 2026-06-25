import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Initialisation de Resend avec la clé d'API globale d'ABJ Tech
const resend = new Resend(process.env.RESEND_API_KEY);

export const onOrderConfirmedCRM = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const nextData = change.after.data();
    const prevData = change.before.data();
    const orderId = context.params.orderId;

    // Déclencheur strict : Uniquement quand la commande passe de PENDING à CONFIRMED (Paiement validé)
    if (prevData.status === "PENDING" && nextData.status === "CONFIRMED") {
      try {
        // 1. Récupérer les articles et l'identifiant du vendeur
        const itemsSnapshot = await db.collection("orderItems").where("orderId", "==", orderId).limit(1).get();
        if (itemsSnapshot.empty) return;
        
        const itemData = itemsSnapshot.docs[0].data();
        const sellerId = itemData.sellerId;

        // 2. Récupérer le profil du vendeur pour extraire ses canaux de notification (Max 3)
        const sellerSnap = await db.collection("sellerProfiles").doc(sellerId).get();
        const sellerEmails: string[] = sellerSnap.data()?.automation?.relanceEmails || [];

        // 3. Récupérer l'email de l'acheteur
        const buyerSnap = await db.collection("users").doc(nextData.buyerId).get();
        const buyerEmail = buyerSnap.data()?.email;

        // 4. Envoi de l'email à l'Acheteur (Rassurance Séquestre)
        if (buyerEmail) {
          await resend.emails.send({
            from: "Mokolo Market <noreply@abjtech.com>",
            to: buyerEmail,
            subject: `🛒 Commande Sécurisée #${orderId}`,
            html: `
              <h1>Votre paiement a été reçu avec succès !</h1>
              <p>Montant total : <strong>${nextData.totalXAF.toLocaleString()} XAF</strong></p>
              <p>🛡️ <strong>Garantie Séquestre ABJ Tech :</strong> Votre argent est conservé en toute sécurité. Le vendeur ne sera crédité que lorsque vous aurez validé la livraison et attribué votre note 5 étoiles.</p>
            `,
          });
        }

        // 5. Envoi des notifications CRM au Vendeur (Sur ses adresses configurées)
        if (sellerEmails.length > 0) {
          const targets = sellerEmails.filter(email => email.trim() !== "");
          
          await resend.emails.send({
            from: "Serveur Central Mokolo <crm@abjtech.com>",
            to: targets, // Routage omnicanal vers les boîtes du vendeur
            subject: `🚨 Nouvelle vente à expédier - Commande #${orderId}`,
            html: `
              <h2>Félicitations ! Un article de votre catalogue a été acheté.</h2>
              <p>Montant net qui sera versé sur votre solde après livraison : <strong>${itemData.sellerAmount.toLocaleString()} XAF</strong></p>
              <p>Veuillez préparer le colis. Un livreur Mokolo Market va vous contacter.</p>
            `,
          });
        }

      } catch (error) {
        console.error("Erreur lors de l'envoi des automatisations d'emails :", error);
      }
    }
  });
