const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const { generateQR } = require("../services/qr");
const Consultation = require("../models/Consultation");
const { getIO } = require("../socket");
const { encrypt, decrypt, decryptAndParse } = require("../utils/encryption");

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

  // Apply FLE1 - Encrypt sensitive medical data
  const medicalRecord = new MedicalRecord({
    patientId,
    allergies: encrypt(JSON.stringify(allergies)),
    chronicDiseases: encrypt(JSON.stringify(chronicDiseases)),
    treatments: encrypt(JSON.stringify(treatments)),
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
      patient: {
        ...patient.toObject(),
        firstName: decrypt(patient.firstName),
        lastName: decrypt(patient.lastName),
        email: decrypt(patient.email),
        phoneNumber: decrypt(patient.phoneNumber),
        dateOfBirth: decrypt(patient.dateOfBirth),
      },
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
      patient: {
        ...patient.toObject(),
        firstName: decrypt(patient.firstName),
        lastName: decrypt(patient.lastName),
        email: decrypt(patient.email),
        phoneNumber: decrypt(patient.phoneNumber),
        dateOfBirth: decrypt(patient.dateOfBirth),
      },
      medicalRecord: {
        ...medicalRecord.toObject(),
        allergies: decryptAndParse(medicalRecord.allergies),
        chronicDiseases: decryptAndParse(medicalRecord.chronicDiseases),
        treatments: decryptAndParse(medicalRecord.treatments),
        attachments: decryptAndParse(medicalRecord.attachments),
      },
      qrImage,
      consultations: null,
    });
  }

  res.status(200).json({
    patient: {
      ...patient.toObject(),
      firstName: decrypt(patient.firstName),
      lastName: decrypt(patient.lastName),
      email: decrypt(patient.email),
      phoneNumber: decrypt(patient.phoneNumber),
      dateOfBirth: decrypt(patient.dateOfBirth),
    },
    qrImage,
    medicalRecord: {
      ...medicalRecord.toObject(),
      allergies: decryptAndParse(medicalRecord.allergies),
      chronicDiseases: decryptAndParse(medicalRecord.chronicDiseases),
      treatments: decryptAndParse(medicalRecord.treatments),
      attachments: decryptAndParse(medicalRecord.attachments),
    },
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
    firstName: decrypt(patient.firstName),
  });
  // generate qr Image
  const qrImage = await generateQR(patient.qrToken);
  const medicalRecord = await MedicalRecord.findOne({
    patientId: patient._id,
  }).populate("patientId");
  if (!medicalRecord) {
    return res.status(200).json({
      patient: {
        ...patient.toObject(),
        firstName: decrypt(patient.firstName),
        lastName: decrypt(patient.lastName),
        email: decrypt(patient.email),
        phoneNumber: decrypt(patient.phoneNumber),
        dateOfBirth: decrypt(patient.dateOfBirth),
      },
      qrImage,
      medicalRecord: null,
    });
  }
  const consultations = await Consultation.find({
    medicalRecord: medicalRecord._id,
  }).sort({ createdAt: -1 });
  if (!consultations) {
    return res.status(200).json({
      patient: {
        ...patient.toObject(),
        firstName: decrypt(patient.firstName),
        lastName: decrypt(patient.lastName),
        email: decrypt(patient.email),
        phoneNumber: decrypt(patient.phoneNumber),
        dateOfBirth: decrypt(patient.dateOfBirth),
      },
      medicalRecord: {
        ...medicalRecord.toObject(),
        allergies: decryptAndParse(medicalRecord.allergies),
        chronicDiseases: decryptAndParse(medicalRecord.chronicDiseases),
        treatments: decryptAndParse(medicalRecord.treatments),
        attachments: decryptAndParse(medicalRecord.attachments),
      },
      qrImage,
      consultations: null,
    });
  }

  res.status(200).json({
    patient: {
      ...patient.toObject(),
      firstName: decrypt(patient.firstName),
      lastName: decrypt(patient.lastName),
      email: decrypt(patient.email),
      phoneNumber: decrypt(patient.phoneNumber),
      dateOfBirth: decrypt(patient.dateOfBirth),
    },
    qrImage,
    medicalRecord: {
      ...medicalRecord.toObject(),
      allergies: decryptAndParse(medicalRecord.allergies),
      chronicDiseases: decryptAndParse(medicalRecord.chronicDiseases),
      treatments: decryptAndParse(medicalRecord.treatments),
      attachments: decryptAndParse(medicalRecord.attachments),
    },
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

  // Apply FLE1 - Encrypt treatment before saving
  const decryptedTreatments = JSON.parse(decrypt(medicalRecord.treatments));
  decryptedTreatments.push(treatment);
  medicalRecord.treatments = encrypt(JSON.stringify(decryptedTreatments));
  await medicalRecord.save();

  res.status(201).json({ message: "Treatment added", medicalRecord });
};

module.exports = {
  addMedicalRecord,
  getMedicalRecord,
  getMedicalRecordByToken,
  addTreatment,
};
