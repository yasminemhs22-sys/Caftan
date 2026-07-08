/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    // Sans ce bloc, next/image refuse de charger toute image hébergée sur
    // Supabase Storage (logo, produits, collections, galerie, bannières...
    // tout ce qui est uploadé depuis le Dashboard admin) et plante au
    // rendu. Le sous-domaine exact dépend du projet Supabase de chacun,
    // d'où le joker "*.supabase.co" plutôt qu'un nom de domaine fixe.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
