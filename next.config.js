/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para deploy na Vercel
  experimental: {
    // Permite importações de arquivos JSON como módulos
    turbo: {
      resolveAlias: {
        // Alias para facilitar imports
        '@': './',
      },
    },
  },
  
  // Configurações de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configurations para otimizações
  webpack: (config, { isServer }) => {
    // Adiciona suporte para imagens otimizadas
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;