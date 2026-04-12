const crypto = require("crypto");
const QRCode = require("qrcode");

const generateToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

const generateQR = async (qrToken) => {
  const url = `http://localhost:8080/doctor-record/${qrToken}`;
  const qrImage = await QRCode.toDataURL(url);
  return { qrImage };
};

module.exports = {
  generateToken,
  generateQR,
};
