'use client';

/**
 * frontend/components/RiadFilter.js
 *
 * Client Component — Search and filter bar for the home page.
 * Reads/writes Next.js search params via useRouter.
 */

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';

const VILLES = ['Toutes', 'Marrakech', 'Fès', 'Essaouira', 'Rabat', 'Casablanca', 'Chefchaouen'];

export default function RiadFilter({ currentParams = {} }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [search,   setSearch]   = useState(currentParams.search   || '');
  const [ville,    setVille]    = useState(currentParams.ville    || '');
  const [minPrix,  setMinPrix]  = useState(currentParams.min_prix || '');
  const [maxPrix,  setMaxPrix]  = useState(currentParams.max_prix || '');
  const [showMore, setShowMore] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search)           params.set('search',   search.trim());
    if (ville && ville !== 'Toutes') params.set('ville', ville);
    if (minPrix)          params.set('min_prix', minPrix);
    if (maxPrix)          params.set('max_prix', maxPrix);
    router.push(`${pathname}?${params.toString()}`);
  }, [search, ville, minPrix, maxPrix, router, pathname]);

  const clearFilters = () => {
    setSearch('');
    setVille('');
    setMinPrix('');
    setMaxPrix('');
    router.push(pathname);
  };

  const hasActiveFilters = search || (ville && ville !== 'Toutes') || minPrix || maxPrix;

  return (
    <div className="flex flex-col gap-3">
      {/* Main row */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="riad-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Rechercher un riad..."
            className="input-field pl-9 pr-4 py-2.5 text-sm"
            aria-label="Rechercher un riad par nom ou description"
          />
        </div>

        {/* Ville select */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <select
            id="riad-ville-filter"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="input-field pl-9 pr-8 py-2.5 text-sm appearance-none cursor-pointer min-w-[140px]"
            aria-label="Filtrer par ville"
          >
            {VILLES.map((v) => (
              <option key={v} value={v === 'Toutes' ? '' : v} className="bg-riad-panel">
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced filters toggle */}
        <button
          id="toggle-advanced-filters"
          onClick={() => setShowMore(!showMore)}
          className={`btn-ghost gap-2 border border-riad-border py-2.5 ${showMore ? 'text-gold-400 border-gold-600/40' : ''}`}
          aria-expanded={showMore}
          aria-label="Afficher les filtres de prix"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
        </button>

        {/* Apply button */}
        <button
          id="apply-filters-btn"
          onClick={applyFilters}
          className="btn-gold py-2.5 px-5"
        >
          Rechercher
        </button>

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            className="btn-ghost text-red-400 hover:text-red-300 py-2.5"
            aria-label="Effacer tous les filtres"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        )}
      </div>

      {/* Advanced: price range */}
      {showMore && (
        <div className="flex flex-wrap gap-3 items-center pt-1 pb-1 border-t border-riad-border animate-fade-up">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Prix / nuit (MAD) :</span>
          <input
            id="min-prix-input"
            type="number"
            value={minPrix}
            onChange={(e) => setMinPrix(e.target.value)}
            placeholder="Min"
            min="0"
            className="input-field w-28 py-2 text-sm"
            aria-label="Prix minimum par nuit"
          />
          <span className="text-text-muted text-sm">—</span>
          <input
            id="max-prix-input"
            type="number"
            value={maxPrix}
            onChange={(e) => setMaxPrix(e.target.value)}
            placeholder="Max"
            min="0"
            className="input-field w-28 py-2 text-sm"
            aria-label="Prix maximum par nuit"
          />
        </div>
      )}
    </div>
  );
}
