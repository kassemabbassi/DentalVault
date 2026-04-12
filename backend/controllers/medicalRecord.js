const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const { generateQR } = require("../services/qr");
const Consultation = require("../models/Consultation");
const { getIO } = require("../socket");
const addMedicalRecord = async (req, res) => {
  const { patientId } = req.params;
  const { allergies, chronicDiseases, treatments } = req.body;
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const existingRecord = await MedicalRecord.findOne({ patientId });
  if (existingRecord) {
    return res
      .status(400)
      .json({ message: "Medical record already exists for this patient" });
  }
  const medicalRecord = new MedicalRecord({
    patientId,
    allergies,
    chronicDiseases,
    treatments,
  });
  await medicalRecord.save();
  res.status(201).json({ message: "Medical record created", medicalRecord });
};

const getMedicalRecord = async (req, res) => {
  const { patientId } = req.params;
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return res.status(404).json({ message: "Invalid QR" });
  }
  // generate qr Image
  const qrImage = await generateQR(patient.qrToken);
  const medicalRecord = await MedicalRecord.findOne({
    patientId: patient._id,
  }).populate("patientId");
  if (!medicalRecord) {
    return res.status(200).json({
      patient,
      qrImage,
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
      qrImage,
      consultations: null,
    });
  }

  res.status(200).json({
    patient,
    qrImage,
    medicalRecord,
    consultations,
  });
};

const getMedicalRecordByToken = async (req, res) => {
  const { token } = req.params;
  const patient = await Patient.findOne({ qrToken: token });

  if (!patient) {
    return res.status(404).json({ message: "Invalid QR" });
  }
  const io = getIO();
  io.emit("qrScanned", {
    patientId: patient._id,
    firstName: patient.firstName,
  });
  // generate qr Image
  const qrImage = await generateQR(patient.qrToken);
  const medicalRecord = await MedicalRecord.findOne({
    patientId: patient._id,
  }).populate("patientId");
  if (!medicalRecord) {
    return res.status(200).json({
      patient,
      qrImage,
      medicalRecord: null,
    });
  }
  const consultations = await Consultation.find({
    medicalRecord: medicalRecord._id,
  }).sort({ createdAt: -1 });
  if (!consultations) {
    return res.status(200).json({
      patient,
      medicalRecord,
      qrImage,
      consultations: null,
    });
  }

  res.status(200).json({
    patient,
    qrImage,
    medicalRecord,
    consultations,
  });
};

const addTreatment = async (req, res) => {
  const { medicalRecordId } = req.params;
  const treatment = req.body;
  const medicalRecord = await MedicalRecord.findById(medicalRecordId);
  if (!medicalRecord) {
    return res.status(404).json({ message: "Medical record not found" });
  }

  medicalRecord.treatments.push(treatment);
  await medicalRecord.save();

  res.status(201).json({ message: "Treatment added", medicalRecord });
};

module.exports = {
  addMedicalRecord,
  getMedicalRecord,
  getMedicalRecordByToken,
  addTreatment,
};
