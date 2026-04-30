const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const Consultation = require("../models/Consultation");
const { decrypt, decryptPatient, decryptMedicalRecord } = require("../utils/encryption");

const scanQr = async (req, res) => {
  const { token } = req.params;
  console.log("token ", token);

  const patient = await Patient.findOne({ qrToken: token });
  if (!patient) {
    return res.status(404).json({ message: "Invalid QR" });
  }

  const decPatient = decryptPatient(patient);

  const medicalRecord = await MedicalRecord.findOne({ patient: patient._id });
  if (!medicalRecord) {
    return res.status(200).json({
      patient: decPatient,
      medicalRecord: null,
      consultations: null,
    });
  }

  const decMedicalRecord = decryptMedicalRecord(medicalRecord);

  const consultations = await Consultation.find({
    medicalRecord: medicalRecord._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    patient: decPatient,
    medicalRecord: decMedicalRecord,
    consultations: consultations ?? null,
  });
};

module.exports = { scanQr };