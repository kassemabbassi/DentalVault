const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const Consultation = require("../models/Consultation");
const { decrypt, decryptAndParse } = require("../utils/encryption");

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
      patient: {
        ...patient.toObject(),
        firstName: decrypt(patient.firstName),
        lastName: decrypt(patient.lastName),
        email: decrypt(patient.email),
        phoneNumber: decrypt(patient.phoneNumber),
        dateOfBirth: decrypt(patient.dateOfBirth),
      },
      medicalRecord: null,
      consultations: null,
    });
  }

  const consultations = await Consultation.find({
    medicalRecord: medicalRecord._id,
  }).sort({ createdAt: -1 });

  if (!consultations || consultations.length === 0) {
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
    medicalRecord: {
      ...medicalRecord.toObject(),
      allergies: JSON.parse(decrypt(medicalRecord.allergies)),
      chronicDiseases: JSON.parse(decrypt(medicalRecord.chronicDiseases)),
      treatments: JSON.parse(decrypt(medicalRecord.treatments)),
      attachments: medicalRecord.attachments ? JSON.parse(decrypt(medicalRecord.attachments)) : [],
    },
    consultations,
  });
};

module.exports = {
  scanQr,
};
