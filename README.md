# DentalVault

**DentalVault** est une application web de gestion de dossiers dentaires conçue pour faciliter la consultation et le suivi des informations patient par les professionnels de santé. Le projet réunit une interface web, une API REST et des services de stockage pour gérer les comptes, les dossiers médicaux, les pièces jointes et l’accès à un dossier via un QR code.

> **Important — sécurité des secrets :** le dépôt contient actuellement un fichier `backend/.env` versionné. Il semble contenir des identifiants et des clés de service. Révoquez et remplacez immédiatement toutes les valeurs qui y ont été exposées, puis retirez ce fichier de l’historique et du dépôt. Ne réutilisez jamais ces valeurs. Le `.gitignore` actuel ne suffit pas à ignorer ce fichier déjà suivi.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture et technologies](#architecture-et-technologies)
- [Structure du dépôt](#structure-du-dépôt)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Configuration](#configuration)
- [API](#api)
- [Protection des données](#protection-des-données)
- [Scripts disponibles](#scripts-disponibles)
- [Dépannage](#dépannage)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Fonctionnalités

- Création de compte et connexion des utilisateurs.
- Consultation et gestion des dossiers patients et de leurs informations médicales.
- Ajout de traitements et de pièces jointes aux dossiers.
- Stockage des fichiers médicaux avec Supabase Storage.
- Accès à un dossier à partir d’un jeton/QR code.
- Communication temps réel préparée avec Socket.IO.
- Chiffrement applicatif de certains champs sensibles avant leur enregistrement dans MongoDB.

Les fonctionnalités, les rôles et les règles d’accès effectives dépendent de l’implémentation actuelle du backend. Consultez le code et testez les parcours dans un environnement non productif avant tout déploiement.

## Architecture et technologies

| Couche | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui et Radix UI |
| Routage et données | React Router, TanStack Query, Axios |
| Backend | Node.js, Express 5 |
| Base de données | MongoDB avec Mongoose |
| Fichiers | Supabase Storage (`medical-files`) |
| Authentification | JSON Web Tokens (JWT), mots de passe hachés avec bcryptjs |
| Chiffrement applicatif | AES-256-GCM via le module `crypto` de Node.js |
| Temps réel | Socket.IO |

## Structure du dépôt

```text
DentalVault/
├── backend/
│   ├── config/          # Connexions MongoDB et Supabase
│   ├── controllers/     # Logique métier de l’API
│   ├── models/          # Modèles Mongoose
│   ├── routes/          # Routes Express
│   ├── services/        # Services applicatifs
│   ├── utils/           # Utilitaires, dont le chiffrement
│   ├── index.js         # Point d’entrée du serveur
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Composants d’interface
    │   ├── hooks/       # Hooks React
    │   ├── pages/       # Pages de l’application
    │   └── lib/         # Utilitaires et intégrations
    ├── package.json
    └── vite.config.ts
```

## Prérequis

- Node.js 18 ou une version ultérieure et npm.
- Une instance MongoDB accessible depuis le backend.
- Un projet Supabase avec Storage configuré et un bucket nommé `medical-files`.
- Une clé de chiffrement hexadécimale de 32 octets (64 caractères hex).

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/kassemabbassi/DentalVault.git
cd DentalVault
```

### 2. Configurer le backend

```bash
cd backend
npm install
```

Créez un fichier local `backend/.env` à partir du modèle ci-dessous et remplacez chaque valeur par vos propres secrets (voir [Configuration](#configuration)). Ne publiez jamais ce fichier.

Lancez l’API depuis le dossier `backend` :

```bash
node index.js
```

Le serveur écoute par défaut sur [http://localhost:5000](http://localhost:5000). La route racine retourne un message de statut.

> **Note sur les scripts npm du backend :** les scripts déclarés dans `backend/package.json` pointent vers `server.js`, alors que le point d’entrée présent dans le dépôt est `index.js`. Utilisez `node index.js` pour le lancement, ou mettez à jour les scripts avant d’utiliser `npm start`/`npm run dev`.

### 3. Configurer le frontend

Dans un autre terminal, depuis la racine du dépôt :

```bash
cd frontend
npm install
npm run dev
```

Vite démarre l’application sur [http://localhost:8080](http://localhost:8080). Le backend autorise actuellement les requêtes cross-origin provenant de cette origine.

## Configuration

Le backend charge les variables d’environnement avec `dotenv`. Exemple de fichier `backend/.env` — utilisez uniquement des valeurs locales ou des secrets fraîchement générés :

```dotenv
MONGO_URI=mongodb://localhost:27017/dentalvault
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=replace_with_your_supabase_service_role_key
ENCRYPTION_KEY=replace_with_64_hex_characters
```

| Variable | Obligatoire | Description |
|---|---:|---|
| `MONGO_URI` | Oui | URI de connexion MongoDB. |
| `JWT_SECRET` | Oui | Secret utilisé pour signer les jetons JWT. |
| `PORT` | Non | Port HTTP de l’API ; `5000` par défaut. |
| `SUPABASE_URL` | Oui | URL du projet Supabase. |
| `SUPABASE_SERVICE_KEY` | Oui | Clé serveur Supabase utilisée pour Storage. Gardez-la exclusivement côté backend. |
| `ENCRYPTION_KEY` | Oui | Clé AES-256 encodée en hexadécimal, exactement 64 caractères. |

Générez une clé de chiffrement aléatoire avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

La configuration vérifie également l’existence du bucket Supabase `medical-files` au démarrage. Créez ce bucket dans votre projet Supabase avant de lancer le serveur. Définissez des politiques d’accès adaptées à votre application et n’exposez jamais la clé de service dans le frontend.

## API

L’API est exposée par défaut à `http://localhost:5000`. Les routes suivantes sont déclarées dans le backend :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Vérifie que le serveur répond (`API Running...`). |
| `POST` | `/register/` | Crée un compte utilisateur. |
| `POST` | `/login/` | Connecte un utilisateur. |
| `GET` | `/scan/:token` | Consulte un dossier à partir d’un jeton de scan. |
| `POST` | `/medicalRecord/:patientId` | Crée un dossier médical pour un patient. |
| `GET` | `/medicalRecord/:patientId` | Récupère le dossier médical d’un patient. |
| `GET` | `/medicalRecord/doctor/:token` | Récupère un dossier via le jeton du médecin. |
| `POST` | `/medicalRecord/addTreatment/:medicalRecordId` | Ajoute un traitement au dossier indiqué. |
| `POST` | `/upload/` | Téléverse une pièce jointe ; le champ multipart attendu est `file`. |

Les paramètres et formats de réponse sont définis dans les contrôleurs. Cette liste reflète les routes Express actuellement déclarées ; elle ne constitue pas une spécification OpenAPI.

## Protection des données

Le backend chiffre avec **AES-256-GCM** certains champs de données personnelles et médicales avant leur stockage dans MongoDB. Les mots de passe sont hachés avec bcryptjs. Les fichiers sont stockés dans Supabase Storage, et certaines métadonnées de pièces jointes sont également chiffrées par l’application.

Ces mécanismes ne constituent pas, à eux seuls, une garantie de conformité réglementaire ou une sécurité complète. Avant tout usage avec de vraies données de santé :

- retirez du dépôt les secrets exposés et faites-les tourner immédiatement ;
- stockez les secrets dans un gestionnaire de secrets ou dans l’environnement sécurisé du déploiement ;
- configurez TLS, les contrôles d’accès, les politiques Supabase, les sauvegardes et la journalisation ;
- vérifiez les autorisations de chaque route, la gestion des sessions et les règles de partage par QR code ;
- appliquez les obligations légales et réglementaires pertinentes dans votre juridiction.

N’utilisez pas ce projet pour traiter des données réelles de santé avant une revue de sécurité et de conformité adaptée.

## Scripts disponibles

### Frontend (`frontend/`)

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur de développement Vite. |
| `npm run build` | Génère le build de production dans `dist/`. |
| `npm run preview` | Prévisualise le build localement. |
| `npm run lint` | Exécute ESLint. |
| `npm test` | Exécute les tests Vitest une fois. |
| `npm run test:watch` | Exécute Vitest en mode surveillance. |

### Backend (`backend/`)

Le point d’entrée actuel est `index.js`. Lancez-le avec `node index.js`. Les scripts `start` et `dev` du package référencent `server.js` et doivent être corrigés pour fonctionner avec la structure actuelle.

## Dépannage

- **Le backend s’arrête au démarrage :** vérifiez les variables requises dans `backend/.env`, la connexion MongoDB et l’existence du bucket `medical-files` dans Supabase.
- **Le navigateur bloque les appels API :** l’origine CORS configurée côté serveur est `http://localhost:8080`. Si le port ou le domaine du frontend change, adaptez la configuration CORS dans `backend/index.js` et `backend/socket.js`.
- **Erreur de déchiffrement :** vérifiez que `ENCRYPTION_KEY` est exactement la même que celle utilisée lors du chiffrement des données. Une perte ou une modification de cette clé peut rendre les données chiffrées illisibles.
- **`npm start` ne trouve pas `server.js` :** lancez `node index.js` ou corrigez les scripts du `backend/package.json`.


