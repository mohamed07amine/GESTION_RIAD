'use client';

/**
 * frontend/components/MobileMenu.js
 *
 * Client component that handles the hamburger / mobile slide-down menu.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        id="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        className="p-2 rounded-lg text-text-secondary hover:text-gold-400
                   hover:bg-riad-panel transition-all duration-200"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-16 inset-x-0 z-40
                     bg-riad-card border-b border-riad-border
                     shadow-[0_16px_40px_rgba(0,0,0,0.6)]
                     animate-fade-up"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium text-text-secondary rounded-xl
                         hover:text-gold-400 hover:bg-riad-panel transition-all duration-200"
            >
              🏛 Tous les Riads
            </Link>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium text-text-secondary rounded-xl
                         hover:text-gold-400 hover:bg-riad-panel transition-all duration-200"
            >
              ⚙️ Administration
            </Link>
            <div className="pt-2 border-t border-riad-border mt-1">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="btn-gold w-full justify-center"
              >
                Espace Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
