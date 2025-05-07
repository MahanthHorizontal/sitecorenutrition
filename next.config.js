/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Or just omit this header entirely
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // Or restrict to Sitecore: "frame-ancestors 'self' https://your-sitecore-domain.com"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
