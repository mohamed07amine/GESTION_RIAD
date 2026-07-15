/**
 * frontend/app/riads/[id]/page.js
 *
 * Riad Details Page — Server Component
 * Fetches the specific riad and its rooms, and embeds the interactive BookingForm.
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowLeft, CheckCircle2, Coffee, Wifi, Wind } from 'lucide-react';
import BookingForm from '@/components/BookingForm';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchRiad(id) {
  try {
    const res = await fetch(`${API}/riads/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[RiadDetails] Failed to fetch riad ${id}:`, err.message);
    return null;
  }
}

async function fetchChambres(riadId) {
  try {
    const res = await fetch(`${API}/riads/${riadId}/chambres`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`[RiadDetails] Failed to fetch chambres for riad ${riadId}:`, err.message);
    return [];
  }
}

// ── Metadata Generation ───────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const riad = await fetchRiad(params.id);
  if (!riad) return { title: 'Riad introuvable' };

  return {
    title: `${riad.nom} - ${riad.ville || 'Maroc'}`,
    description: riad.description?.substring(0, 160) || `Découvrez le ${riad.nom} au Maroc.`,
  };
}

// ── Page Component ────────────────────────────────────────────────────────────

export default async function RiadDetailsPage({ params }) {
  const riad = await fetchRiad(params.id);

  if (!riad) {
    notFound(); // Triggers Next.js 404 page
  }

  const chambres = await fetchChambres(params.id);
  const fallbackImg = `https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80`;

  return (
    <div className="min-h-screen pb-20">
      
      {/* ── Hero Image Header ── */}
      <div className="relative h-[40vh] min-h-[300px] md:h-[50vh] w-full">
        <Image
          src={riad.image_url || fallbackImg}
          alt={`Photo du ${riad.nom}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-riad-dark via-riad-dark/40 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-black/40 backdrop-blur-md border border-white/10
                       text-amber-50 text-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-amber-50 drop-shadow-lg">
            {riad.nom}
          </h1>
          {riad.ville && (
            <p className="flex items-center gap-2 text-gold-300 text-lg mt-2 font-medium drop-shadow-md">
              <MapPin className="w-5 h-5" />
              {riad.ville}{riad.adresse ? ` — ${riad.adresse}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          
          {/* Left Column: Details & Rooms */}
          <div className="lg:col-span-2 space-y-10 animate-fade-up">
            
            {/* Description */}
            <section className="card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-amber-50 mb-4">À propos de ce Riad</h2>
              <div className="gold-divider my-4"></div>
              <p className="text-text-secondary text-base leading-relaxed whitespace-pre-line">
                {riad.description || "Aucune description disponible pour ce riad."}
              </p>

              {/* Amenities (Hardcoded for aesthetics, normally from DB) */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Wifi className="w-5 h-5 text-gold-500" /> Wi-Fi Gratuit
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Coffee className="w-5 h-5 text-gold-500" /> Petit-déjeuner
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Wind className="w-5 h-5 text-gold-500" /> Climatisation
                </div>
              </div>
            </section>

            {/* Chambres List */}
            <section>
              <h2 className="font-display text-3xl font-bold text-amber-50 mb-6">Chambres Disponibles</h2>
              
              {chambres.length === 0 ? (
                <div className="card p-8 text-center text-text-muted border-dashed border-2">
                  <p>Aucune chambre n'a été ajoutée à ce riad.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chambres.map((chambre) => (
                    <div key={chambre.id} className="card p-5 flex flex-col hover:border-gold-600/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display font-bold text-lg text-amber-50">
                          {chambre.nom}
                        </h3>
                        {chambre.disponible ? (
                          <span className="badge-available">Disponible</span>
                        ) : (
                          <span className="badge-unavailable">Indisponible</span>
                        )}
                      </div>
                      
                      {chambre.type && (
                        <p className="text-sm text-text-muted mb-4">{chambre.type}</p>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-riad-border flex items-center justify-between">
                        <div className="text-gold-400 font-bold">
                          {Number(chambre.prix_nuit).toLocaleString('fr-MA')} MAD<span className="text-text-muted text-xs font-normal">/nuit</span>
                        </div>
                        <CheckCircle2 className={`w-5 h-5 ${chambre.disponible ? 'text-emerald-500' : 'text-riad-border'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm riadId={riad.id} chambres={chambres} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
