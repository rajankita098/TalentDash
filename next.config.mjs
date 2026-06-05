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
  
  // 🏡 LANDING PAGE UPDATE: We removed the old redirects array completely 
  // so Next.js serves your beautiful new app/page.tsx landing layout right at the root domain!
};

export default nextConfig;