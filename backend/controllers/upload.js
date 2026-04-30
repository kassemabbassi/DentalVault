const multer = require("multer");
const { supabase } = require("../config/supabase");
const MedicalRecord = require("../models/MedicalRecord");
const { encrypt } = require("../utils/encryption");

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
    const { medicalRecordId, patientId, customName } = req.body;
    const file = req.file;

    if (!file || !medicalRecordId || !patientId || !customName) {
      return res.status(400).json({ message: "Fichier, medicalRecordId, patientId et nom sont requis" });
    }

    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    const timestamp = Date.now();
    const storagePath = `patients/${patientId}/attachments/${timestamp}-${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-files")
      .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (uploadError) {
      return res.status(500).json({ message: "Erreur upload Supabase", error: uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from("medical-files")
      .getPublicUrl(storagePath);

    let attachmentType = "image";
    if (file.mimetype.startsWith("audio")) attachmentType = "audio";
    if (file.originalname.toLowerCase().includes("xray")) attachmentType = "xray";

    const newAttachment = {
      type: attachmentType,
      fileName: encrypt(file.originalname),   // ✅ chiffré
      customName: encrypt(customName),         // ✅ chiffré
      mimeType: file.mimetype,
      size: file.size,
      url: urlData.publicUrl,
      storagePath,
    };

    medicalRecord.attachments.push(newAttachment);
    medicalRecord.updatedAt = Date.now();
    await medicalRecord.save();

    // Retourner l'attachment déchiffré au frontend
    return res.status(201).json({
      message: "Fichier uploadé avec succès",
      attachment: {
        ...newAttachment,
        fileName: file.originalname,
        customName,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { upload, uploadAttachment };
