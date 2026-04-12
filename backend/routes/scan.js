const express = require("express");
const router = express.Router();
const { scanQr } = require("../controllers/scan");

router.get("/:token", scanQr);

module.exports = router;
