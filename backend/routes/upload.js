const express = require("express");
const router = express.Router();
const { upload, uploadAttachment } = require("../controllers/upload");

router.post("/", upload.single("file"), uploadAttachment);

module.exports = router;