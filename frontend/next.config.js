/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commenté temporairement pour permettre l'accès à la page login
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // Redirection générale de l'API
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
      // Routes d'upload d'images
      {
        source: '/api/upload',
        destination: 'http://localhost:8001/api/upload',
      },
      // Routes spécifiques pour le dashboard admin
      {
        source: '/api/admin/dashboard/:path*',
        destination: 'http://localhost:8001/api/admin/dashboard/:path*',
      },
      // Routes spécifiques pour le dashboard
      {
        source: '/api/dashboard/:path*',
        destination: 'http://localhost:8001/api/dashboard/:path*',
      },
      // Routes du dashboard stats
      {
        source: '/api/dashboard/stats',
        destination: 'http://localhost:8001/api/dashboard/stats',
      },
      // Routes du dashboard recent activities
      {
        source: '/api/dashboard/recent-activities',
        destination: 'http://localhost:8001/api/dashboard/recent-activities',
      },
      // Routes du dashboard top products
      {
        source: '/api/dashboard/top-products',
        destination: 'http://localhost:8001/api/dashboard/top-products',
      },
      // Routes pour les produits et leurs actions
      {
        source: '/api/products/:id/:action',
        destination: 'http://localhost:8001/api/products/:id/:action',
      },
      // Routes pour les catégories et leurs actions
      {
        source: '/api/categories/:id/:action',
        destination: 'http://localhost:8001/api/categories/:id/:action',
      },
      // Route du tenant dashboard
      {
        source: '/api/tenant/dashboard',
        destination: 'http://localhost:8001/api/tenant/dashboard',
      },
      // Route du tenant-admin dashboard (nouvelle route)
      {
        source: '/api/tenant-admin/dashboard',
        destination: 'http://localhost:8001/api/tenant/dashboard',
      },
      // Routes spécifiques pour le tenant-admin
      {
        source: '/api/tenant-admin/:path*',
        destination: 'http://localhost:8001/api/tenant/:path*',
      },
      // Redirection des images uploadées
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8001/uploads/:path*',
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
