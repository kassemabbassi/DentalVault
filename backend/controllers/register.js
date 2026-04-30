const { generateToken } = require("../services/qr");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { encrypt, decryptPatient } = require("../utils/encryption");

const register = async (req, res) => {
  console.log("Received registration data:", req.body);
  const {
    firstName,
    lastName,
    cin,
    email,
    phoneNumber,
    password,
    dateOfBirth,
  } = req.body;

  try {
    const encryptedCin = encrypt(cin);
    const encryptedEmail = encrypt(email);
    const encryptedPhone = encrypt(phoneNumber);

    const existingPatient = await Patient.findOne({ cin: encryptedCin });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient déjà enregistré" });
    }

    const qrToken = generateToken();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
      firstName,
      lastName,
      cin: encryptedCin,
      email: encryptedEmail,
      phoneNumber: encryptedPhone,
      hashedPassword,
      dateOfBirth: encryptedDateOfBirth,
      qrToken,
    });

    await newPatient.save();

    const patient = await Patient.findOne({ cin: encryptedCin });

    const payload = {
      userId: patient._id,
      cin: patient.cin,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "SUPER_SECRET_KEY",
      { expiresIn: "60d" }
    );

    // Déchiffrer avant d'envoyer au frontend
    const decryptedPatient = decryptPatient(patient);

    return res.status(201).json({
      message: "Patient registered successfully",
      token,
      patient: decryptedPatient,
    });

  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register };