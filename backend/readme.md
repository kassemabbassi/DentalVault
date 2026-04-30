# DentalVault Backend

## 🔐 Field-Level Encryption (FLE) Implementation

### Qu'est-ce que c'est ?
Field-Level Encryption (FLE) signifie que les données sensibles des patients sont **chiffrées avant d'être stockées** dans la base de données. Seul le backend peut les déchiffrer avec la clé secrète (`ENCRYPTION_KEY`).

### Données chiffrées
- ✅ Patient : `firstName`, `lastName`, `email`, `phoneNumber`, `dateOfBirth`
- ✅ Medical Record : `allergies`, `chronicDiseases`, `treatments`, `attachments`
- ❌ Non chiffrées : `CIN` (pour les recherches), `hashedPassword` (déjà hashé)

---

## 🛠️ Comment ça fonctionne

### 1️⃣ **À l'enregistrement (Signup)**
```
Frontend → Envoie données en clair → Backend
Backend → Chiffre avec AES-256-GCM → Stocke en BD
```
Les données deviennent : `IV:AuthTag:DonnéeChiffrée` (ex: `a1b2c3:f7e8d9:9f8e7d...`)

### 2️⃣ **À la connexion (Login)**
```
Backend → Récupère données chiffrées de la BD
Backend → Déchiffre les champs sensibles
Frontend → Reçoit données en CLAIR
```

### 3️⃣ **À la lecture du dossier médical**
```
Backend → Déchiffre + Parse JSON
Frontend → Reçoit arrays/objets lisibles
```

---

## 📝 Fichiers modifiés

| Fichier | Modification | Raison |
|---------|---|---|
| **utils/encryption.js** | Ajout `decryptAndParse()` | Déchiffrement sûr avec gestion d'erreurs |
| **models/Patient.js** | `dateOfBirth`: String | Le chiffré est une string, pas une Date |
| **models/MedicalRecord.js** | `allergies/treatments/attachments`: String | Stockage de JSON chiffré, pas d'arrays |
| **controllers/register.js** | Chiffrement des données | Protéger les données à l'inscription |
| **controllers/login.js** | Déchiffrement avant retour | Frontend doit avoir données en clair |
| **controllers/medicalRecord.js** | Chiffrement/Déchiffrement | Protection complète du dossier médical |
| **controllers/scan.js** | Déchiffrement avant envoi | Données lisibles pour les médecins |
| **controllers/upload.js** | Chiffrement métadonnées | Protéger les infos des fichiers |

---

## ❓ Pourquoi String et pas Array/Object ?

### Le problème
**Avant :** On stockait directement les arrays/dates dans MongoDB
```javascript
allergies: ["Pénicilline", "Arachides"]  // Type: [String]
dateOfBirth: new Date("1990-05-15")     // Type: Date
```

**Après chiffrement :** Les données deviennent une chaîne chiffrée
```javascript
allergies: "a1b2c3:f7e8d9:9f8e7d6c5b4a..."  // C'est une STRING !
dateOfBirth: "d4c3b2a1:e5f6d9c0:3a2b1c0d..."  // C'est une STRING !
```

### La solution
✅ Changer les modèles Mongoose à **String** pour que MongoDB accepte les données chiffrées :
```javascript
allergies: String,              // Stocke le JSON chiffré
dateOfBirth: String,            // Stocke la date chiffrée
treatments: String,             // Stocke l'array chiffré
attachments: String,            // Stocke les objets chiffrés
```

Quand on **déchiffre**, on retrouve le format original :
```javascript
const allergies = decryptAndParse(medicalRecord.allergies);  // → ["Pénicilline", "Arachides"]
```

---

## 🔑 Configuration

Ajouter dans `.env` :
```
ENCRYPTION_KEY=d8f3a2c1e4b7f9d0c3a2e1b4d7f8c9e0d8f3a2c1e4b7f9d0c3a2e1b4d7f8c9e0
```

**Format :** Clé hexadécimale de 64 caractères (256 bits pour AES-256)

---

## 🚀 Utilisation

### Chiffrer des données
```javascript
const { encrypt } = require("./utils/encryption");
const encrypted = encrypt("Ahmed");  // → "a1b2c3:f7e8d9:9f8e..."
```

### Déchiffrer et parser JSON
```javascript
const { decryptAndParse } = require("./utils/encryption");
const allergies = decryptAndParse(encryptedData);  // → ["Pénicilline"]
```

---

## ✨ Avantages

- 🔒 **Sécurité** : Données en clair jamais stockées
- 🔄 **Intégrité** : Tag d'authentification GCM vérifie pas de modification
- 🎲 **Aléatoire** : IV différent à chaque chiffrement (même donnée ≠ même chiffré)
- 🔙 **Rétrocompatibilité** : Gère les anciens users non chiffrés
