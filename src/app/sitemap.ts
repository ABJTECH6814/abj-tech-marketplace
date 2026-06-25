import { MetadataRoute } from "next";

// Sitemap volontairement statique pour le MVP. Next.js exécute toujours
// sitemap.ts pendant le build (même avec "force-dynamic"), donc on ne peut
// pas y faire d'appel Firebase sans risquer de casser le build si jamais
// les credentials ne sont pas accessibles dans ce contexte précis.
// → Un sitemap dynamique (produits + boutiques) sera réintroduit en V1 via
// une autre approche (ex: génération planifiée par Cloud Function).
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mokolo-market.vercel.app";

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/auth`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
  ];
}
