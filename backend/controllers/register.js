const { generateToken, generateQR } = require("../services/qr");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../utils/encryption");
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
    const existingPatient = await Patient.findOne({ cin });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient déjà enregistré" });
    }
    // Generate QR token
    const qrToken = generateToken();

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Apply FLE1 - Encrypt sensitive fields
    const encryptedFirstName = encrypt(firstName);
    const encryptedLastName = encrypt(lastName);
    const encryptedEmail = encrypt(email);
    const encryptedPhoneNumber = encrypt(phoneNumber);
    const encryptedDateOfBirth = encrypt(dateOfBirth);

    // Save patient to DB
    const newPatient = new Patient({
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      cin,
      email: encryptedEmail,
      phoneNumber: encryptedPhoneNumber,
      hashedPassword,
      dateOfBirth: encryptedDateOfBirth,
      qrToken,
    });
    await newPatient.save();
    const patient = await Patient.findOne({ cin });
     const payload = {
          userId: patient._id,
          cin: patient.cin,
          // tu peux ajouter role plus tard
        };
    
        // 🔹 5. Génération token
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "SUPER_SECRET_KEY", // ⚠️ .env recommandé
          {
            expiresIn: "60d", // hackathon → long
          },
        );

    return res.status(201).json({
  message: "Patient registered successfully",
  token,
  patient,
});
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
};
