const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
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

  // Vérifier si les données sont au format chiffré (IV:AuthTag:Encrypted)
  if (typeof text !== 'string' || !text.includes(':')) {
    // Données non chiffrées - retourner telles quelles
    return text;
  }

  try {
    const [ivHex, authTagHex, encrypted] = text.split(":");

    // Vérifier que tous les composants existent
    if (!ivHex || !authTagHex || !encrypted) {
      return text; // Format incorrect - retourner tel quel
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    // En cas d'erreur de déchiffrement, retourner les données originales
    return text;
  }
};

// Helper function to safely decrypt and parse JSON
const decryptAndParse = (text, defaultValue = []) => {
  try {
    if (!text) return defaultValue;
    const decrypted = decrypt(text);
    if (!decrypted) return defaultValue;
    return JSON.parse(decrypted);
  } catch (e) {
    // En cas d'erreur, retourner la valeur par défaut
    return defaultValue;
  }
};

module.exports = { encrypt, decrypt, decryptAndParse };