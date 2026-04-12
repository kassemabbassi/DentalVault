const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient");

const login = async (req, res) => {
  try {
    const { cin, password } = req.body;

    // 🔹 1. Validation input
    if (!cin || !password) {
      return res.status(400).json({
        message: "CIN and password are required",
      });
    }

    // 🔹 2. Chercher user par CIN
    const patient = await Patient.findOne({ cin });

    if (!patient) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔹 3. Vérifier password (bcrypt)
    const isMatch = await bcrypt.compare(password, patient.hashedPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 🔹 4. Payload JWT (ce que tu veux encoder)
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

    // 🔹 6. Réponse
    return res.status(200).json({
      message: "Login successful",
      token,
      patient,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  login,
};
