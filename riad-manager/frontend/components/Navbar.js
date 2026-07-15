/**
 * frontend/components/Navbar.js
 *
 * Responsive navigation bar — Server Component with a client-side
 * mobile menu handled via <MobileMenu />.
 */

import Link from 'next/link';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Navigation principale">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Moroccan lantern SVG icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700
                            flex items-center justify-center shadow-gold-sm
                            group-hover:shadow-gold-md transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-riad-dark" aria-hidden="true">
                <path d="M12 2L8 6v2l-3 2v8l2 2h6l2-2V10L12 8V6L12 2z"
                      fill="currentColor" opacity="0.9"/>
                <path d="M9 20l1 2h4l1-2" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <span className="font-display text-lg font-bold text-gradient-gold leading-none">
                Riad Manager
              </span>
              <span className="block text-[10px] text-text-muted tracking-widest uppercase leading-none mt-0.5">
                Maroc · Authenticité
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/"
              className="px-4 py-2 text-sm font-medium text-text-secondary rounded-lg
                         hover:text-gold-400 hover:bg-riad-panel transition-all duration-200">
              Riads
            </Link>
            <Link href="/admin"
              className="px-4 py-2 text-sm font-medium text-text-secondary rounded-lg
                         hover:text-gold-400 hover:bg-riad-panel transition-all duration-200">
              Administration
            </Link>
            <div className="w-px h-5 bg-riad-border mx-2" aria-hidden="true" />
            <Link href="/admin"
              className="btn-gold text-xs px-4 py-2">
              Espace Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
