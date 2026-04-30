const multer = require("multer");
const { supabase } = require("../config/supabase");
const MedicalRecord = require("../models/MedicalRecord");
const { encrypt, decrypt } = require("../utils/encryption");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"), false);
    }
  },
});

const uploadAttachment = async (req, res) => {
  try {
    const { medicalRecordId, patientId, customName } = req.body;
    const file = req.file;

    if (!file || !medicalRecordId || !patientId || !customName) {
      return res.status(400).json({ message: "Fichier, medicalRecordId, patientId et nom sont requis" });
    }

    // 1. Vérifier que le dossier médical existe
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    // 2. Construire le chemin dans Supabase
    const timestamp = Date.now();
    const storagePath = `patients/${patientId}/attachments/${timestamp}-${file.originalname}`;

    // 3. Upload vers Supabase
    const { error: uploadError } = await supabase.storage
      .from("medical-files")
      .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (uploadError) {
      return res.status(500).json({ message: "Erreur upload Supabase", error: uploadError.message });
    }

    // 4. Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from("medical-files")
      .getPublicUrl(storagePath);

    // 5. Déterminer le type
    let attachmentType = "image";
    if (file.mimetype.startsWith("audio")) attachmentType = "audio";
    if (file.originalname.toLowerCase().includes("xray")) attachmentType = "xray";

    // 6. Construire l'attachment
    const newAttachment = {
      type: attachmentType,
      fileName: file.originalname,
      customName,
      mimeType: file.mimetype,
      size: file.size,
      url: urlData.publicUrl,
      storagePath,
    };

    // 7. Apply FLE1 - Récupérer et déchiffrer les attachments existants
    let attachments = [];
    if (medicalRecord.attachments) {
      try {
        attachments = JSON.parse(decrypt(medicalRecord.attachments));
      } catch (e) {
        // Si pas de attachments chiffrés, utiliser array vide
        attachments = [];
      }
    }

    // 8. Ajouter le nouvel attachment
    attachments.push(newAttachment);

    // 9. Chiffrer l'array complet des attachments
    medicalRecord.attachments = encrypt(JSON.stringify(attachments));
    medicalRecord.updatedAt = Date.now();
    await medicalRecord.save();

    return res.status(201).json({
      message: "Fichier uploadé avec succès",
      attachment: newAttachment,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { upload, uploadAttachment };
