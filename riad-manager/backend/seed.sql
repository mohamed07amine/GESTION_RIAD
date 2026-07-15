-- =============================================================
-- seed.sql — Riad Manager Seed Data
-- Run AFTER schema.sql
-- =============================================================

-- ---------------------------------------------------------------
-- Riads (3 entries)
-- ---------------------------------------------------------------
INSERT INTO riads (nom, ville, adresse, description, prix_nuit, image_url) VALUES
(
  'Riad Al Andalous',
  'Marrakech',
  '12, Derb Sidi Bouloukat, Médina, Marrakech',
  'Un havre de paix au cœur de la médina de Marrakech. Riad Al Andalous mêle architecture andalouse et art berbère avec ses zellige colorés, ses fontaines de marbre et ses jardins parfumés de jasmin.',
  1200.00,
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800'
),
(
  'Riad Dar Zitoun',
  'Fès',
  '24, Talaa Kbira, Médina de Fès',
  'Niché dans le quartier historique de Fès el-Bali, Dar Zitoun est un riad du XIVe siècle entièrement restauré. Ses patios ombragés, ses stuc ciselés et sa terrasse panoramique offrent une immersion totale dans l''esprit fassi.',
  950.00,
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
),
(
  'Riad Les Orangers d''Alili',
  'Essaouira',
  '5, Rue Ibn Rochd, Medina, Essaouira',
  'Face à l''Atlantique, ce riad bleu et blanc conjugue charme gnaoui et fraîcheur côtière. Profitez de ses terrasses balayées par la brise de mer, de ses salons berbères et de son hammam privatif.',
  780.00,
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
);

-- ---------------------------------------------------------------
-- Chambres — 2 per riad (6 total)
-- ---------------------------------------------------------------
-- Riad Al Andalous (id = 1)
INSERT INTO chambres (riad_id, nom, type, prix_nuit, disponible) VALUES
(1, 'Suite Sultana',    'Suite',          1500.00, TRUE),
(1, 'Chambre Jasmin',   'Double Standard', 900.00, TRUE);

-- Riad Dar Zitoun (id = 2)
INSERT INTO chambres (riad_id, nom, type, prix_nuit, disponible) VALUES
(2, 'Suite Royale Fassi', 'Suite',          1200.00, TRUE),
(2, 'Chambre Zellij',     'Double Standard', 750.00, FALSE);

-- Riad Les Orangers d'Alili (id = 3)
INSERT INTO chambres (riad_id, nom, type, prix_nuit, disponible) VALUES
(3, 'Suite Atlantique',  'Suite',           1000.00, TRUE),
(3, 'Chambre Coquillage','Simple Standard',  580.00, TRUE);

-- ---------------------------------------------------------------
-- Clients (2 entries)
-- ---------------------------------------------------------------
INSERT INTO clients (nom, prenom, email, telephone) VALUES
('Benali',   'Youssef', 'youssef.benali@email.ma',  '+212 6 61 23 45 67'),
('Dupont',   'Claire',  'claire.dupont@email.fr',   '+33 6 78 90 12 34');

-- ---------------------------------------------------------------
-- Reservations (sample bookings)
-- ---------------------------------------------------------------
INSERT INTO reservations (client_id, chambre_id, date_debut, date_fin, statut) VALUES
(1, 1, '2026-08-01', '2026-08-05', 'confirmee'),
(2, 3, '2026-08-10', '2026-08-15', 'en_attente');
