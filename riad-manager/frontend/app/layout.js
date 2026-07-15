/**
 * frontend/app/layout.js
 *
 * Root Layout — Server Component
 * Wraps every page with the Navbar, a global Toaster for notifications,
 * and consistent HTML structure.
 */

import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

// ── Font configuration ────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// ── Metadata (SEO) ────────────────────────────────────────────────────────────

export const metadata = {
  title: {
    default: 'Riad Manager — Discover Authentic Moroccan Riads',
    template: '%s | Riad Manager',
  },
  description:
    "Explore and book extraordinary riads across Morocco's most iconic medinas. " +
      "Experience authentic Moroccan hospitality at its finest.",
  keywords: ['riad', 'maroc', 'morocco', 'marrakech', 'fes', 'essaouira', 'booking', 'hébergement'],
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Riad Manager',
    title: 'Riad Manager — Découvrez les plus beaux riads du Maroc',
    description: 'Réservez votre séjour dans les riads les plus authentiques du Maroc.',
  },
};

// ── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-riad-dark antialiased">

        {/* Navigation */}
        <Navbar />

        {/* Page content — padded below fixed navbar */}
        <main className="pt-16">
          {children}
        </main>

        {/* Toast notifications (rendered client-side) */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a110a',
              color: '#f5e6cc',
              border: '1px solid #3d2b1a',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#d99a1f', secondary: '#0f0a05' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0f0a05' } },
          }}
        />

      </body>
    </html>
  );
}
