/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🏎️ F6/FS3 REQUIREMENT: Whitelist your external corporate logo vector CDN domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.vectorlogo.zone',
      },
    ],
  },

  // 🏡 HOME PAGE REQUIREMENT: Automatically redirect root URL (/) straight to your salaries ledger
  async redirects() {
    return [
      {
        source: '/',
        destination: '/salaries',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;