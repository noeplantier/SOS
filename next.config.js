/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async rewrites() {
    // URL en dur pour éviter tout problème de variables
    const n8nUrl = 'http://localhost:5678';
    
    return [{
      source: '/api/n8n/:path*',
      destination: `${n8nUrl}/:path*`
    }];
  },
};

module.exports = nextConfig;