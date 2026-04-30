const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
if (!process.env.ENCRYPTION_KEY) {
  console.error("❌ ENCRYPTION_KEY manquante dans .env");
  process.exit(1);
}

if (process.env.ENCRYPTION_KEY.length !== 64) {
  console.error(`❌ ENCRYPTION_KEY invalide — doit faire 64 caractères hex, actuellement ${process.env.ENCRYPTION_KEY.length}`);
  process.exit(1);
}

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

const encrypt = (text) => {
  if (!text) return text;

  // IV aléatoire de 16 bytes — différent à chaque chiffrement
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  // Auth tag — garantit l'intégrité des données
  const authTag = cipher.getAuthTag().toString("hex");

  // On stocke les 3 ensemble séparés par ":" pour pouvoir déchiffrer plus tard
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

const decrypt = (text) => {
  if (!text) return text;

  try {
    const parts = text.split(":");

    // Vérifie que le format iv:authTag:données est respecté
    if (parts.length !== 3) {
      console.warn("⚠️ Valeur non chiffrée ou format invalide — retournée telle quelle");
      return text;
    }

    const [ivHex, authTagHex, encrypted] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;

  } catch (error) {
    console.error("❌ Erreur déchiffrement :", error.message);
    return null;
  }
};


// ── Helpers déchiffrement ──

const decryptPatient = (patient) => {
  const p = patient.toObject ? patient.toObject() : { ...patient };
  return {
    ...p,
    cin: decrypt(p.cin),
    email: decrypt(p.email),
    phoneNumber: decrypt(p.phoneNumber),
  };
};

const decryptMedicalRecord = (medicalRecord) => {
  const m = medicalRecord.toObject ? medicalRecord.toObject() : { ...medicalRecord };
  return {
    ...m,
    allergies: (m.allergies ?? []).map((a) => decrypt(a)),
    chronicDiseases: (m.chronicDiseases ?? []).map((d) => decrypt(d)),
    treatments: (m.treatments ?? []).map((t) => ({
      ...t,
      name: decrypt(t.name),
      description: decrypt(t.description),
    })),
    attachments: (m.attachments ?? []).map((a) => ({
      ...a,
      fileName: decrypt(a.fileName),
      customName: decrypt(a.customName),
    })),
  };
};
// Ajouter dans utils/encryption.js
module.exports = { encrypt, decrypt, decryptPatient, decryptMedicalRecord };