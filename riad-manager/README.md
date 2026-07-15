# Riad Manager 🕌

Riad Manager est une application web complète (Full-Stack) permettant la gestion et la réservation de riads au Maroc. Elle est construite avec **Node.js, Express, PostgreSQL** pour le back-end, et **Next.js 14 (App Router)** pour le front-end.

## Architecture du Projet

Le projet suit strictement la structure demandée :

```text
riad-manager/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── riadController.js
│   │   │   ├── chambreController.js
│   │   │   └── reservationController.js
│   │   ├── routes/
│   │   │   ├── riadRoutes.js
│   │   │   ├── chambreRoutes.js
│   │   │   └── reservationRoutes.js
│   │   └── server.js
│   ├── schema.sql
│   ├── seed.sql
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.js
│   │   ├── riads/[id]/page.js
│   │   ├── admin/page.js
│   │   ├── layout.js
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── MobileMenu.js
│   │   ├── RiadFilter.js
│   │   └── BookingForm.js
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── next.config.js
│   └── package.json
│
└── README.md
```

---

## 🛠️ Installation et Démarrage

### 1. Base de données (PostgreSQL)

Assurez-vous que PostgreSQL est installé et en cours d'exécution.

1. Créez une base de données nommée `riad_manager` :
   ```bash
   createdb riad_manager -U postgres
   ```
2. Dans le dossier `backend/`, initialisez le schéma et les données :
   ```bash
   cd backend
   psql -U postgres -d riad_manager -f schema.sql
   psql -U postgres -d riad_manager -f seed.sql
   ```

### 2. Back-end (API)

1. Naviguez vers le dossier `backend/` et installez les dépendances :
   ```bash
   cd backend
   npm install
   ```
2. Copiez le fichier d'environnement et ajustez-le si nécessaire :
   ```bash
   cp .env.example .env
   ```
3. Démarrez le serveur (en mode développement) :
   ```bash
   npm run dev
   ```
   L'API sera accessible sur `http://localhost:5000`.

### 3. Front-end (Next.js)

1. Ouvrez un nouveau terminal, naviguez vers le dossier `frontend/` et installez les dépendances :
   ```bash
   cd frontend
   npm install
   ```
2. Copiez le fichier d'environnement :
   ```bash
   cp .env.example .env.local
   ```
3. Démarrez l'application Next.js :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

---

## 🌟 Fonctionnalités

### Back-end
- **PostgreSQL & pg** : Connexion via un pool de connexions (`config/db.js`).
- **Architecture Modulaire** : Séparation claire entre routes et contrôleurs.
- **Validation** : Vérification des données entrantes avec `express-validator`.
- **Règle métier critique (Overlap)** : Le contrôleur de réservation vérifie via une transaction SQL qu'aucune chambre n'est doublement réservée pour les mêmes dates, en utilisant l'algèbre des intervalles d'Allen.
- **Sécurité (Bonus)** : Middleware d'authentification JWT (`middleware/auth.js`) protégeant les routes de création, modification et suppression (simulé pour l'admin).

### Front-end
- **Next.js 14 App Router** : Composants serveur pour la performance (SSR/ISR) et composants clients pour l'interactivité.
- **Design Premium** : Thème sombre inspiré de l'artisanat marocain avec Tailwind CSS (couleurs or, ombres portées, animations fluides).
- **Page d'accueil (`/`)** : Liste des riads avec barre de recherche et filtres dynamiques (ville, prix).
- **Page Détails Riad (`/riads/[id]`)** : Présentation riche du riad, de ses chambres et de leurs disponibilités.
- **Formulaire de Réservation** : Interaction fluide avec gestion des erreurs (chevauchement de dates) via `react-hot-toast`.
- **Dashboard Admin (`/admin`)** : Interface complète de gestion (CRUD) des riads.

---
*Projet généré par Antigravity.*
