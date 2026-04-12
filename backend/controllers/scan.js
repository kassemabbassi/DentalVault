const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const Consultation = require("../models/Consultation");

const scanQr = async (req, res) => {
  const { token } = req.params;
  console.log("token ", token);
  const patient = await Patient.findOne({ qrToken: token });

  if (!patient) {
    return res.status(404).json({ message: "Invalid QR" });
  }
  const medicalRecord = await MedicalRecord.findOne({
    patient: patient._id,
  }).populate("patient");
  if (!medicalRecord) {
    return res.status(200).json({
      patient,
      medicalRecord: null,
      consultations: null,
    });
  }
  const consultations = await Consultation.find({
    medicalRecord: medicalRecord._id,
  }).sort({ createdAt: -1 });
  if (!consultations) {
    return res.status(200).json({
      patient,
      medicalRecord,
      consultations: null,
    });
  }

  res.status(200).json({
    patient,
    medicalRecord,
    consultations,
  });
};

module.exports = {
  scanQr,
};
