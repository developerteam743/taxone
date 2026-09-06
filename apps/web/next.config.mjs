/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.taxone.vyapar.com',
      },
      {
        protocol: 'https',
        hostname: 'strapi.taxone.vyapar.com',
      },
    ],
  },
};

export default nextConfig;

