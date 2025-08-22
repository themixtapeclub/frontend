const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  
  reactStrictMode: true,
  
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.swell.store',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.schema.io',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/themixtapeshop/**'
      }
    ]
  },
  
  experimental: {
    optimizePackageImports: [
      '@sanity/client',
      '@sanity/image-url',
      '@headlessui/react',
      '@heroicons/react',
      'tailwindcss'
    ],
    scrollRestoration: true
  },
  
  env: {
    SANITY_FETCH_TIMEOUT: '15000',
    SWELL_FETCH_TIMEOUT: '15000'
  },
  
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'encrypted-media=*'
          }
        ]
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300'
          }
        ]
      }
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/password',
        destination: '/',
        permanent: true
      }
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
    const webpack = require('webpack');
    
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sanity/visual-editing': false,
        '@sanity/visual-editing/react': false,
        '@sanity/visual-editing/remix': false,
        '@sanity/visual-editing/next': false,
        '@sanity/preview-kit': false,
        '@sanity/preview-kit/client': false,
        '@sanity/preview-kit/react': false,
        '@sanity/preview-url-secret': false,
        '@sanity/overlays': false,
      };
      
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@sanity\/(visual-editing|preview-kit|preview-url-secret|overlays)/
        })
      );
      
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /next-sanity\/visual-editing/,
          require.resolve('./lib/cms/sanity/noop.js')
        )
      );
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'tr46/lib/mappingTable.json': false,
      tr46: false
    };
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/mappingTable\.json$/,
        contextRegExp: /tr46/
      })
    );
    
    return config;
  },
  
  output: 'standalone',
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn']
          }
        : false
  },
  
  poweredByHeader: false,
  compress: true
};

module.exports = withBundleAnalyzer(nextConfig);
