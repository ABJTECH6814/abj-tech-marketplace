import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mokolo-market.vercel.app";

  // 1. Pages Statiques de Base
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/auth`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() }
  ];

  const dynamicRoutes: { url: string; lastModified: Date }[] = [];

  try {
    // 2. Indexation dynamique des Produits Actifs (Limité à 100 pour le MVP)
    const productQuery = query(collection(db, "products"), where("status", "==", "ACTIVE"), limit(100));
    const productSnapshot = await getDocs(productQuery);
    
    productSnapshot.forEach((doc) => {
      dynamicRoutes.push({
        url: `${baseUrl}/products/${doc.id}`,
        lastModified: new Date() // Idéalement, parser la valeur de doc.data().createdAt
      });
    });

    // 3. Indexation dynamique des Boutiques Vendeurs
    const sellerQuery = collection(db, "sellerProfiles");
    const sellerSnapshot = await getDocs(sellerQuery);

    sellerSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.shopSlug) {
        dynamicRoutes.push({
          url: `${baseUrl}/shop/${data.shopSlug}`,
          lastModified: new Date()
        });
      }
    });
  } catch (error) {
    console.error("Erreur génération sitemap dynamique :", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
