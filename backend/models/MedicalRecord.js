const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    unique: true,
  },

  allergies: [String],
  chronicDiseases: [String],

  treatments: [
    {
      name: String,
      description: String,
      date: Date,
    },
  ],

  attachments: [
    {
      type: {
        type: String,
        enum: ["image", "xray", "audio"],
      },
      fileName: {
        type: String,
        required: true,
      },
      customName: {       // ✅ nom écrit par le médecin
        type: String,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      storagePath: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);