const express = require("express");
const router = express.Router();
const {
  addMedicalRecord,
  getMedicalRecord,
  getMedicalRecordByToken,
  addTreatment,
} = require("../controllers/medicalRecord");

router.post("/addTreatment/:medicalRecordId", addTreatment);
router.post("/:patientId", addMedicalRecord);
router.get("/doctor/:token", getMedicalRecordByToken);
router.get("/:patientId", getMedicalRecord);
module.exports = router;
