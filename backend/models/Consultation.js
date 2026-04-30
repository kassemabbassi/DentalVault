const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
    required: true,
  },

  notes: [
    {
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Consultation", consultationSchema);