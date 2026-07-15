/**
 * frontend/app/page.js
 *
 * Home Page — Server Component
 * Fetches the list of riads from the backend at render time (SSR).
 * Includes a client-side search/filter bar via <RiadFilter />.
 */

import Image from 'next/image';
import Link  from 'next/link';
import { MapPin, Star, Bed } from 'lucide-react';
import RiadFilter from '@/components/RiadFilter';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Riads au Maroc — Séjours Authentiques',
  description:
    'Découvrez notre sélection de riads marocains d\'exception. ' +
    'Marrakech, Fès, Essaouira — réservez votre séjour inoubliable.',
};

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchRiads(searchParams) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const params = new URLSearchParams();
  if (searchParams?.search)   params.set('search',   searchParams.search);
  if (searchParams?.ville)    params.set('ville',    searchParams.ville);
  if (searchParams?.min_prix) params.set('min_prix', searchParams.min_prix);
  if (searchParams?.max_prix) params.set('max_prix', searchParams.max_prix);

  const url = `${API}/riads${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('[Home] Failed to fetch riads:', err.message);
    return [];
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RiadCard({ riad }) {
  const fallbackImg = `https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80`;

  return (
    <article className="card group flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={riad.image_url || fallbackImg}
          alt={`Photo du ${riad.nom}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-riad-dark/80 via-transparent to-transparent" />

        {/* Price badge */}
        {riad.prix_nuit && (
          <div className="absolute top-3 right-3
                          bg-riad-dark/80 backdrop-blur-sm
                          border border-gold-600/40
                          rounded-xl px-3 py-1.5">
            <span className="text-gold-400 font-bold text-sm">
              {Number(riad.prix_nuit).toLocaleString('fr-MA')} MAD
            </span>
            <span className="text-text-muted text-[10px]">/nuit</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-amber-50 leading-snug
                         group-hover:text-gold-400 transition-colors duration-200">
            {riad.nom}
          </h2>
          {riad.ville && (
            <p className="flex items-center gap-1.5 text-text-secondary text-xs mt-1">
              <MapPin className="w-3.5 h-3.5 text-gold-500" aria-hidden="true" />
              {riad.ville}
            </p>
          )}
        </div>

        {riad.description && (
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
            {riad.description}
          </p>
        )}

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-auto">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < 5 ? 'text-gold-500 fill-gold-500' : 'text-riad-border'}`} />
          ))}
          <span className="text-text-muted text-xs ml-1">(5.0)</span>
        </div>

        <Link
          href={`/riads/${riad.id}`}
          id={`view-riad-${riad.id}`}
          className="btn-gold mt-2 w-full"
          aria-label={`Voir les détails du riad ${riad.nom}`}
        >
          <Bed className="w-4 h-4" aria-hidden="true" />
          Voir & Réserver
        </Link>
      </div>
    </article>
  );
}

function EmptyState({ search }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-20 h-20 rounded-full bg-riad-panel border border-riad-border
                      flex items-center justify-center text-3xl">
        🏚
      </div>
      <h3 className="font-display text-xl text-amber-50">Aucun riad trouvé</h3>
      {search && (
        <p className="text-text-secondary text-sm">
          Aucun résultat pour « <em className="text-gold-400">{search}</em> ».
        </p>
      )}
      <p className="text-text-muted text-sm">Essayez d'autres critères de recherche.</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage({ searchParams }) {
  const riads = await fetchRiads(searchParams);

  return (
    <div className="min-h-screen">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-zellige">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-hero-gradient opacity-90" aria-hidden="true" />
        <div className="absolute inset-0"
             style={{
               background: 'radial-gradient(ellipse at 30% 50%, rgba(217,154,31,0.12) 0%, transparent 70%)',
             }}
             aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center animate-fade-up">
            {/* Ornamental line */}
            <div className="gold-divider max-w-xs mx-auto mb-6">
              <span className="text-gold-500 text-xs tracking-[0.3em] uppercase font-semibold">
                Bienvenue
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-amber-50 leading-tight">
              Découvrez l'Âme du{' '}
              <span className="text-gradient-gold">Maroc</span>
            </h1>

            <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Des riads d'exception nichés au cœur des médinas les plus mythiques.
              Marrakech, Fès, Essaouira — vivez une expérience hors du temps.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <div className="flex items-center gap-2 bg-riad-panel/60 backdrop-blur-sm
                              border border-riad-border rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span className="text-text-secondary text-sm">{riads.length} riads disponibles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Bar (Client Component) ── */}
      <div className="sticky top-16 z-30 bg-riad-dark/95 backdrop-blur-xl border-b border-riad-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <RiadFilter currentParams={searchParams} />
        </div>
      </div>

      {/* ── Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {riads.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-2xl">
                {searchParams?.search || searchParams?.ville
                  ? `Résultats de recherche`
                  : 'Tous nos Riads'}
              </h2>
              <p className="text-text-muted text-sm mt-1">
                {riads.length} riad{riads.length > 1 ? 's' : ''} trouvé{riads.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {riads.length > 0
            ? riads.map((riad) => <RiadCard key={riad.id} riad={riad} />)
            : <EmptyState search={searchParams?.search} />
          }
        </div>
      </section>

    </div>
  );
}
