/** @type {import('next').NextConfig} */
const nextConfig = {
  // Active explicitement le dossier src/ comme racine de l'application
  // et l'App Router (next/app directory)
  experimental: {},

  // Autorise les images depuis Firebase Storage et Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
