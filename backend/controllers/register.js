const { generateToken, generateQR } = require("../services/qr");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
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
      return res.status(400).json({ message: "Patient already exists" });
    }
    // Generate QR token
    const qrToken = generateToken();

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save patient to DB

    const newPatient = new Patient({
      firstName,
      lastName,
      cin,
      email,
      phoneNumber,
      hashedPassword,
      dateOfBirth,
      qrToken,
    });
    await newPatient.save();

    return res.status(201).json({ message: "Patient registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
};
