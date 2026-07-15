-- =============================================================
-- schema.sql — Riad Manager Database Schema
-- PostgreSQL
-- =============================================================

-- Drop tables in reverse dependency order (for idempotency)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS chambres     CASCADE;
DROP TABLE IF EXISTS clients      CASCADE;
DROP TABLE IF EXISTS riads        CASCADE;

-- ---------------------------------------------------------------
-- TABLE: riads
-- ---------------------------------------------------------------
CREATE TABLE riads (
    id             SERIAL        PRIMARY KEY,
    nom            VARCHAR(150)  NOT NULL,
    ville          VARCHAR(100),
    adresse        VARCHAR(255),
    description    TEXT,
    prix_nuit      DECIMAL(10,2) CHECK (prix_nuit > 0),
    image_url      VARCHAR(500),
    date_creation  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- TABLE: chambres
-- ---------------------------------------------------------------
CREATE TABLE chambres (
    id         SERIAL        PRIMARY KEY,
    riad_id    INTEGER       NOT NULL REFERENCES riads(id) ON DELETE CASCADE,
    nom        VARCHAR(150),
    type       VARCHAR(100),
    prix_nuit  DECIMAL(10,2) CHECK (prix_nuit > 0),
    disponible BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------
-- TABLE: clients
-- ---------------------------------------------------------------
CREATE TABLE clients (
    id         SERIAL       PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    telephone  VARCHAR(30)
);

-- ---------------------------------------------------------------
-- TABLE: reservations
-- ---------------------------------------------------------------
CREATE TABLE reservations (
    id            SERIAL       PRIMARY KEY,
    client_id     INTEGER      NOT NULL REFERENCES clients(id)  ON DELETE RESTRICT,
    chambre_id    INTEGER      NOT NULL REFERENCES chambres(id) ON DELETE RESTRICT,
    date_debut    DATE         NOT NULL,
    date_fin      DATE         NOT NULL,
    statut        VARCHAR(20)  NOT NULL DEFAULT 'en_attente'
                               CHECK (statut IN ('en_attente', 'confirmee', 'annulee')),
    date_creation TIMESTAMP    NOT NULL DEFAULT NOW(),
    -- Business rule: check-out must be strictly after check-in
    CONSTRAINT chk_dates CHECK (date_fin > date_debut)
);

-- ---------------------------------------------------------------
-- Useful indexes: speed up availability overlap queries
-- ---------------------------------------------------------------
CREATE INDEX idx_reservations_chambre ON reservations(chambre_id);
CREATE INDEX idx_reservations_statut  ON reservations(statut);
CREATE INDEX idx_chambres_riad        ON chambres(riad_id);
