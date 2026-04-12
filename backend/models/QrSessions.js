const qrSessionSchema = new mongoose.Schema({
  qrCodeId: String,

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "expired"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: Date,
});
