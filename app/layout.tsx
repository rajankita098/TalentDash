import './globals.css'; // Add this exact import path rule on line 1
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

// --- F5: SEO METADATA CONFIGURATION CORE ---
export const metadata: Metadata = {
  title: 'Tech Software Engineer Salaries Matrix Ledger | TalentDash',
  description: 'Explore verified, high-density crowdsourced compensation data nodes across major corporate tech hubs, tiers, fields, and locations.',
  alternates: {
    canonical: 'http://localhost:3000/salaries', // Prevents duplicate index classification penalties
  },
  openGraph: {
    title: 'Global Tech Talent Ledger Matrix | TalentDash',
    description: 'Explore verified tech compensation data nodes cross-referenced by tier index.',
    url: 'http://localhost:3000/salaries',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}