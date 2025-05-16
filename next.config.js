// filepath: /home/pnoe/SOS/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  // Configurer le routing correctement
  async rewrites() {
    return {
      beforeFiles: [
        // Rediriger les API calls vers n8n si nécessaire
        {
          source: '/api/n8n/:path*',
          destination: `${process.env.NEXT_PUBLIC_N8N_API_URL}/:path*`,
        }
      ]
    };
  }
};

module.exports = nextConfig;