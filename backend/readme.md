# Field-Level Encryption (FLE1) — DentalVault

## Algorithme utilisé
**AES-256-GCM** via le module natif `crypto` de Node.js.

Chaque valeur chiffrée est stockée dans ce format dans MongoDB :
```
iv:authTag:donnéeChiffrée
```
- **iv** — nombre aléatoire unique par chiffrement
- **authTag** — garantit que la donnée n'a pas été modifiée
- **donnéeChiffrée** — la valeur illisible stockée

---

## Fichiers créés / modifiés

| Fichier | Rôle |
|---|---|
| `utils/encryption.js` | Fonctions `encrypt`, `decrypt` et helpers |
| `controllers/register.js` | Chiffre avant save |
| `controllers/login.js` | Chiffre pour chercher, déchiffre avant réponse |
| `controllers/medicalRecord.js` | Chiffre avant save, déchiffre avant réponse |
| `controllers/upload.js` | Chiffre les métadonnées du fichier |
| `controllers/scan.js` | Déchiffre avant réponse |
| `.env` | Contient `ENCRYPTION_KEY` (64 caractères hex) |

---

## Ce qui est chiffré ✅

**Patient**
- `cin` — identifiant national
- `email` — coordonnées personnelles
- `phoneNumber` — coordonnées personnelles

**MedicalRecord**
- `allergies[]` — chaque élément du tableau
- `chronicDiseases[]` — chaque élément du tableau
- `treatments[].name` — nom du traitement
- `treatments[].description` — description du traitement
- `attachments[].fileName` — nom original du fichier
- `attachments[].customName` — nom donné par le médecin

---

## Ce qui n'est pas chiffré ❌

| Champ | Raison |
|---|---|
| `firstName`, `lastName` | Pas sensibles |
| `hashedPassword` | Déjà protégé par bcrypt |
| `qrToken` | Nécessaire en clair pour recherche |
| `_id`, références ObjectId | Nécessaires pour les relations MongoDB |
| `url`, `storagePath` | Nécessaires pour Supabase |
| `mimeType`, `size`, `type` | Pas sensibles |
| `createdAt`, `updatedAt` | Pas sensibles |

---

## Flux de travail

### Écriture (register / addMedicalRecord / upload)
```
Frontend envoie données en clair
      ↓
Express chiffre les champs sensibles
      ↓
MongoDB stocke les données chiffrées
```

### Lecture (login / getMedicalRecord / scan)
```
MongoDB retourne données chiffrées
      ↓
Express déchiffre les champs sensibles
      ↓
Frontend reçoit données en clair
```

### Recherche (login par CIN)
```
Frontend envoie cin en clair
      ↓
Express chiffre le cin reçu
      ↓
MongoDB cherche la valeur chiffrée
```

---

## Ce que voit un attaquant dans MongoDB

```json
{
  "cin": "fd5604a878e8ea:75af8150ce0331:748855356e0e",
  "allergies": ["a5510c5c838ece:9e26cb0c687293:a66f53db68dd"],
  "treatments": [{
    "name": "8ee6c0a58fae15:a8b3cbc4f0e26a:01268c5f236fac"
  }]
}
```

Sans la `ENCRYPTION_KEY` stockée uniquement sur le serveur — **illisible**.