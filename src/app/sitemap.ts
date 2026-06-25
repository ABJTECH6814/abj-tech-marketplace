import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

// ⚠️ CORRECTIF CRITIQUE : sans cette ligne, Next.js essaie d'exécuter cette
// fonction PENDANT le build sur les serveurs Vercel (pas de navigateur réel
// à ce moment-là), ce qui fait échouer l'initialisation Firebase Auth et
// casse tout le build avec "auth/invalid-api-key". "force-dynamic" reporte
// l'exécution au moment où Google ou un visiteur demande réellement /sitemap.xml.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mokolo-market.vercel.app";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/auth`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
  ];

  const dynamicRoutes: { url: string; lastModified: Date }[] = [];

  try {
    const productQuery = query(
      collection(db, "products"),
      where("status", "==", "ACTIVE"),
      limit(100)
    );
    const productSnapshot = await getDocs(productQuery);

    productSnapshot.forEach((doc) => {
      dynamicRoutes.push({
        url: `${baseUrl}/products/${doc.id}`,
        lastModified: new Date(),
      });
    });

    const sellerSnapshot = await getDocs(collection(db, "sellerProfiles"));
    sellerSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.shopSlug) {
        dynamicRoutes.push({
          url: `${baseUrl}/shop/${data.shopSlug}`,
          lastModified: new Date(),
        });
      }
    });
  } catch (error) {
    console.error("Erreur génération sitemap dynamique :", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
