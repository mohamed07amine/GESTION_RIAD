'use client';

/**
 * frontend/components/BookingForm.js
 *
 * Client Component — Handles the interactive reservation flow.
 * Displays success/error states via react-hot-toast.
 * Uses native HTML5 date pickers.
 */

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, User, Mail, Phone, ChevronDown } from 'lucide-react';

export default function BookingForm({ riadId, chambres }) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chambre_id: '',
    date_debut: '',
    date_fin: '',
    client_nom: '',
    client_prenom: '',
    client_email: '',
    client_telephone: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.chambre_id || !formData.date_debut || !formData.date_fin) {
      toast.error('Veuillez sélectionner une chambre et des dates.');
      return;
    }
    if (new Date(formData.date_fin) <= new Date(formData.date_debut)) {
      toast.error('La date de départ doit être ultérieure à la date d\'arrivée.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Réservation confirmée avec succès !');
        // Reset form
        setFormData({
          chambre_id: '',
          date_debut: '',
          date_fin: '',
          client_nom: '',
          client_prenom: '',
          client_email: '',
          client_telephone: '',
        });
      } else {
        // Handle 409 Conflict (Overlap) or 400 Bad Request
        toast.error(data.message || 'Une erreur est survenue lors de la réservation.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Only show available rooms in the dropdown (optional, but good UX)
  const availableChambres = chambres.filter((c) => c.disponible);

  return (
    <div className="card p-6">
      <h3 className="font-display text-2xl font-bold text-amber-50 mb-6">
        Réserver votre séjour
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_debut" className="input-label">Date d'arrivée</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="date_debut"
                name="date_debut"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date_debut}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date_fin" className="input-label">Date de départ</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="date_fin"
                name="date_fin"
                type="date"
                required
                min={formData.date_debut || new Date().toISOString().split('T')[0]}
                value={formData.date_fin}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div>
          <label htmlFor="chambre_id" className="input-label">Chambre</label>
          <div className="relative">
            <select
              id="chambre_id"
              name="chambre_id"
              required
              value={formData.chambre_id}
              onChange={handleChange}
              className="input-field appearance-none pr-10"
            >
              <option value="" disabled>Sélectionnez une chambre...</option>
              {availableChambres.map((chambre) => (
                <option key={chambre.id} value={chambre.id} className="bg-riad-panel">
                  {chambre.nom} — {Number(chambre.prix_nuit).toLocaleString('fr-MA')} MAD/nuit
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
          {availableChambres.length === 0 && (
            <p className="text-red-400 text-xs mt-2">
              Aucune chambre disponible pour ce riad actuellement.
            </p>
          )}
        </div>

        <div className="gold-divider my-2"></div>

        {/* Client Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="client_prenom" className="input-label">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="client_prenom"
                name="client_prenom"
                type="text"
                required
                placeholder="Votre prénom"
                value={formData.client_prenom}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="client_nom" className="input-label">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="client_nom"
                name="client_nom"
                type="text"
                required
                placeholder="Votre nom"
                value={formData.client_nom}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="client_email" className="input-label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="client_email"
              name="client_email"
              type="email"
              required
              placeholder="votre.email@exemple.com"
              value={formData.client_email}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="client_telephone" className="input-label">Téléphone (Optionnel)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="client_telephone"
              name="client_telephone"
              type="tel"
              placeholder="+212 6 XX XX XX XX"
              value={formData.client_telephone}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || availableChambres.length === 0}
          className="btn-gold w-full mt-4"
        >
          {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
        </button>
      </form>
    </div>
  );
}
