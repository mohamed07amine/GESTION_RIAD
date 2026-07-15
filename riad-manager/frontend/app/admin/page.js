'use client';

/**
 * frontend/app/admin/page.js
 *
 * Admin Dashboard — Client Component
 * Provides CRUD interface for Riads.
 * In a real application, you would ensure the user is authenticated (JWT)
 * before rendering this or restrict route access.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Home, MapPin, Loader2, BedDouble } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function AdminPage() {
  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Riad Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    adresse: '',
    description: '',
    prix_nuit: '',
    image_url: '',
  });

  // Chambre Modal State
  const [isChambreModalOpen, setIsChambreModalOpen] = useState(false);
  const [selectedRiadId, setSelectedRiadId] = useState(null);
  const [chambreFormData, setChambreFormData] = useState({
    nom: '',
    type: '',
    prix_nuit: '',
  });

  // JWT Token (For simulation, we fetch a default one or assume it's in localStorage)
  // In a real app, use a proper Auth context. We'll simulate admin token for now.
  const [token, setToken] = useState('');

  // ── Fetch Riads ────────────────────────────────────────────────────────────

  const fetchRiads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/riads`);
      const json = await res.json();
      if (json.success) {
        setRiads(json.data);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des riads.');
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch riads and attempt login to get a dev token (since auth is required for POST/PUT/DELETE)
  useEffect(() => {
    fetchRiads();
    
    // Auto-login as admin for demonstration purposes
    const loginDevAdmin = async () => {
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@riad.ma', password: 'admin123' })
        });
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        }
      } catch (e) {
        console.error('Auto-login failed', e);
      }
    };
    loginDevAdmin();
  }, []);

  // ── Riad Form Handlers ─────────────────────────────────────────────────────

  const handleOpenModal = (riad = null) => {
    if (riad) {
      setEditingId(riad.id);
      setFormData({
        nom: riad.nom || '',
        ville: riad.ville || '',
        adresse: riad.adresse || '',
        description: riad.description || '',
        prix_nuit: riad.prix_nuit || '',
        image_url: riad.image_url || '',
      });
    } else {
      setEditingId(null);
      setFormData({ nom: '', ville: '', adresse: '', description: '', prix_nuit: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Non autorisé. Token manquant.');
      return;
    }

    const isEditing = !!editingId;
    const url = isEditing ? `${API}/riads/${editingId}` : `${API}/riads`;
    const method = isEditing ? 'PUT' : 'POST';

    // Clean payload (remove empty strings so they don't fail backend validation or database inserts)
    const payload = { ...formData };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(isEditing ? 'Riad mis à jour !' : 'Riad créé avec succès !');
        fetchRiads();
        handleCloseModal();
      } else {
        if (data.errors && data.errors.length > 0) {
          toast.error(data.errors[0].msg);
        } else {
          toast.error(data.message || 'Erreur lors de la sauvegarde.');
        }
      }
    } catch (err) {
      toast.error('Erreur réseau.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce riad ? (Toutes les chambres seront supprimées)')) return;
    if (!token) {
      toast.error('Non autorisé. Token manquant.');
      return;
    }

    try {
      const res = await fetch(`${API}/riads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Riad supprimé.');
        fetchRiads();
      } else {
        toast.error(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      toast.error('Erreur réseau.');
    }
  };

  // ── Chambre Form Handlers ──────────────────────────────────────────────────

  const handleOpenChambreModal = (riadId) => {
    setSelectedRiadId(riadId);
    setChambreFormData({ nom: '', type: '', prix_nuit: '' });
    setIsChambreModalOpen(true);
  };

  const handleCloseChambreModal = () => {
    setIsChambreModalOpen(false);
    setSelectedRiadId(null);
  };

  const handleChambreChange = (e) => {
    setChambreFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChambreSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Non autorisé. Token manquant.');
      return;
    }

    const payload = { ...chambreFormData, riad_id: selectedRiadId };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      const res = await fetch(`${API}/chambres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Chambre créée avec succès !');
        handleCloseChambreModal();
      } else {
        if (data.errors && data.errors.length > 0) {
          toast.error(data.errors[0].msg);
        } else {
          toast.error(data.message || 'Erreur lors de la création de la chambre.');
        }
      }
    } catch (err) {
      toast.error('Erreur réseau.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-amber-50 flex items-center gap-3">
            <Home className="w-8 h-8 text-gold-500" />
            Gestion des Riads
          </h1>
          <p className="text-text-secondary mt-1">Espace administrateur protégé</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold">
          <Plus className="w-4 h-4" /> Ajouter un Riad
        </button>
      </div>

      {/* Riad List */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-riad-panel/50 border-b border-riad-border text-gold-400 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Nom du Riad</th>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4">Prix/Nuit (MAD)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-riad-border">
              {riads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-text-muted">
                    Aucun riad trouvé.
                  </td>
                </tr>
              ) : (
                riads.map((riad) => (
                  <tr key={riad.id} className="hover:bg-riad-panel/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-amber-50">
                      {riad.nom}
                    </td>
                    <td className="px-6 py-4 text-text-secondary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-600" /> {riad.ville || '—'}
                    </td>
                    <td className="px-6 py-4 text-amber-50">
                      {riad.prix_nuit ? Number(riad.prix_nuit).toLocaleString('fr-MA') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenChambreModal(riad.id)}
                          className="p-2 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 rounded-lg border border-emerald-900/50 hover:border-emerald-500/50 transition-all"
                          title="Ajouter une chambre"
                        >
                          <BedDouble className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(riad)}
                          className="p-2 bg-riad-panel text-gold-400 hover:text-gold-300 rounded-lg border border-riad-border hover:border-gold-500/50 transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(riad.id)}
                          className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg border border-red-900/50 hover:border-red-500/50 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Riad Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold text-amber-50">
                {editingId ? 'Modifier le Riad' : 'Nouveau Riad'}
              </h2>
              <button onClick={handleCloseModal} className="text-text-muted hover:text-red-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Nom du Riad *</label>
                <input required type="text" name="nom" value={formData.nom} onChange={handleChange} className="input-field" placeholder="Ex: Riad Al Andalous" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Ville</label>
                  <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="input-field" placeholder="Ex: Marrakech" />
                </div>
                <div>
                  <label className="input-label">Prix par Nuit (MAD)</label>
                  <input type="number" step="0.01" name="prix_nuit" value={formData.prix_nuit} onChange={handleChange} className="input-field" placeholder="Ex: 1200" />
                </div>
              </div>

              <div>
                <label className="input-label">Adresse</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="input-field" placeholder="Ex: 12, Derb Sidi Bouloukat" />
              </div>

              <div>
                <label className="input-label">Image URL</label>
                <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="input-field" placeholder="https://images.unsplash.com/..." />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea rows="4" name="description" value={formData.description} onChange={handleChange} className="input-field resize-none" placeholder="Description du riad..."></textarea>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={handleCloseModal} className="btn-ghost border border-riad-border">
                  Annuler
                </button>
                <button type="submit" className="btn-gold">
                  {editingId ? 'Enregistrer' : 'Créer le Riad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chambre Modal Form */}
      {isChambreModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold text-amber-50">
                Nouvelle Chambre
              </h2>
              <button onClick={handleCloseChambreModal} className="text-text-muted hover:text-red-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChambreSubmit} className="space-y-4">
              <div>
                <label className="input-label">Nom de la Chambre *</label>
                <input required type="text" name="nom" value={chambreFormData.nom} onChange={handleChambreChange} className="input-field" placeholder="Ex: Suite Royale" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Type</label>
                  <input type="text" name="type" value={chambreFormData.type} onChange={handleChambreChange} className="input-field" placeholder="Ex: Suite, Standard..." />
                </div>
                <div>
                  <label className="input-label">Prix par Nuit (MAD)</label>
                  <input type="number" step="0.01" name="prix_nuit" value={chambreFormData.prix_nuit} onChange={handleChambreChange} className="input-field" placeholder="Ex: 800" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={handleCloseChambreModal} className="btn-ghost border border-riad-border">
                  Annuler
                </button>
                <button type="submit" className="btn-gold">
                  Créer la Chambre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
