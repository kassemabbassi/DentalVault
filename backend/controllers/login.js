const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient");
const { encrypt, decrypt } = require("../utils/encryption");

const login = async (req, res) => {
  try {
    const { cin, password } = req.body;

    if (!cin || !password) {
      return res.status(400).json({
        message: "CIN and password are required",
      });
    }

    // Chiffrer le cin reçu pour chercher dans MongoDB
    const encryptedCin = encrypt(cin);
    const patient = await Patient.findOne({ cin: encryptedCin });

    if (!patient) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }

    const isMatch = await bcrypt.compare(password, patient.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: "mot de passe incorrect",
      });
    }

    const payload = {
      userId: patient._id,
      cin: patient.cin,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "SUPER_SECRET_KEY",
      { expiresIn: "60d" }
    );

    // Déchiffrer les champs sensibles avant d'envoyer au frontend
    const decryptedPatient = {
      ...patient.toObject(),
      cin: decrypt(patient.cin),
      email: decrypt(patient.email),
      phoneNumber: decrypt(patient.phoneNumber),
    };

    return res.status(200).json({
      message: "Login successful",
      token,
      patient: decryptedPatient,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { login };