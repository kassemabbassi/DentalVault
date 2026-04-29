const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    unique: true,
  },

  // ✅ Chiffré - String contenant JSON chiffré
  allergies: String,

  // ✅ Chiffré - String contenant JSON chiffré
  chronicDiseases: String,

  // ✅ Chiffré - String contenant JSON chiffré
  treatments: String,

  // ✅ Chiffré - String contenant JSON chiffré
  attachments: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);