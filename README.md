# Restaurant App API

API REST Node.js/Express pour gérer les catégories, produits et utilisateurs d'un restaurant.

## Stack

- Node.js + Express
- MySQL (`mysql2/promise`)
- Authentification JWT (`jsonwebtoken`, `bcryptjs`)
- Validation par middlewares
- Documentation Swagger (`/api-docs`)
- Tests d'intégration Jest + Supertest
- Docker / Docker Compose
- CI GitHub Actions

## Structure du projet

```text
.
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed-admin.js
│   ├── middleware/
│   ├── routes/
│   └── services/
└── tests/
```

## Prérequis

- Node.js 20+
- npm
- MySQL 8+ (local) ou Docker

## Configuration

Copiez `.env.example` vers `.env` puis adaptez les valeurs :

```bash
cp .env.example .env
```

Variables principales :

| Variable | Description | Exemple |
| --- | --- | --- |
| `PORT` | Port HTTP de l'API | `3000` |
| `NODE_ENV` | Environnement (`development`, `test`, `production`) | `development` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | `secret` |
| `DB_NAME` | Base de données | `restaurant_db` |
| `DB_ROOT_PASSWORD` | Mot de passe root MySQL (Docker Compose) | `rootsecret` |
| `JWT_SECRET` | Secret de signature JWT | `long_random_secret` |
| `CORS_ORIGIN` | Origines autorisées, séparées par virgules. En production, à définir explicitement. | `http://localhost:5173` |
| `TRUST_PROXY` | Active `trust proxy` Express (`1`/`true`) derrière un reverse proxy | `1` |
| `ADMIN_NAME` | Nom admin pour le seed | `Admin` |
| `ADMIN_EMAIL` | Email admin pour le seed | `admin@example.com` |
| `ADMIN_PASSWORD` | Mot de passe admin pour le seed | `ChangeMe123!` |

> `JWT_SECRET` est obligatoire. Utilisez une valeur longue et aléatoire en production.

## Installation locale

```bash
npm install
```

Initialisez la base de données MySQL avec le schéma canonique :

```bash
mysql -u <user> -p <database> < src/database/schema.sql
```

Optionnel : créer/promouvoir un administrateur :

```bash
npm run seed:admin
```

## Lancer l'application

Développement (reload) :

```bash
npm run dev
```

Production/local simple :

```bash
npm start
```

L'API est disponible sur `http://localhost:3000` (ou `PORT`).

## Docker

Lancer l'API et MySQL :

```bash
docker compose up --build
```

Services :

- API : `http://localhost:3000`
- MySQL : `localhost:3307` (mappé vers `3306` dans le conteneur)

`docker-compose.yml` initialise la base avec `src/database/schema.sql` au premier démarrage du volume MySQL.

## Scripts npm

| Script | Description |
| --- | --- |
| `npm start` | Démarre l'API avec Node |
| `npm run dev` | Démarre l'API avec Nodemon |
| `npm test` | Lance les tests Jest en série (`--runInBand`) |
| `npm run seed:admin` | Crée ou promeut un admin via `ADMIN_*` |

## Tests

Les tests sont des tests d'intégration qui nécessitent une base MySQL accessible et un `JWT_SECRET`.

Exemple :

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=restaurant_db
export JWT_SECRET=test_secret
npm test
```

Sous PowerShell :

```powershell
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="restaurant_db"
$env:JWT_SECRET="test_secret"
npm test
```

## Endpoints principaux

### Health

- `GET /health` — état de l'API et de la base.

### Auth

- `POST /api/auth/register` — crée un utilisateur (`staff` par défaut).
- `POST /api/auth/login` — retourne un JWT.

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` — auth requise (`admin`, `staff`)
- `PUT /api/categories/:id` — auth requise (`admin`)
- `DELETE /api/categories/:id` — auth requise (`admin`)

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` — auth requise (`admin`, `staff`)
- `PUT /api/products/:id` — auth requise (`admin`)
- `DELETE /api/products/:id` — auth requise (`admin`)

Documentation interactive : `GET /api-docs`.

## Stratégie base de données

- `src/database/schema.sql` est la source de vérité pour l'initialisation complète d'une nouvelle base.
- Docker Compose et la CI initialisent la base à partir de ce fichier.
- Les changements incrémentaux pour bases existantes sont versionnés dans `src/database/migrations/` (ex. `002_add_constraints.sql` pour contrainte d'unicité catégorie et FK produit explicite).
- Le script `src/database/seed-admin.js` permet de créer/promouvoir un admin sans modifier le schéma.

## Notes de sécurité

- Les mots de passe sont hashés avec bcrypt.
- Les routes sensibles utilisent JWT + contrôle de rôle.
- Les endpoints `/api` ont une limitation de débit globale; `/api/auth` a une limite plus stricte.
- CORS est configurable par `CORS_ORIGIN`. En production, définir explicitement les origines autorisées.
- `TRUST_PROXY` doit être activé (`1`) derrière un reverse proxy pour que le rate limiting utilise la bonne IP client.
- Le middleware d'erreur ne renvoie pas les détails internes en 5xx.

## CI

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute sur push/PR vers `main` :

- installation des dépendances (`npm ci`)
- initialisation MySQL avec `schema.sql`
- tests Jest
- build Docker
- publication GHCR uniquement sur `push` vers `main`
