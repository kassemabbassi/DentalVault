require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const morgan = require("morgan");

const app = express();
const http = require("http");
const { initSocket } = require("./socket");

const server = http.createServer(app);
const io = initSocket(server);

// Middlewares
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true, // ✅ AJOUT CRITIQUE
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// routes
const registerRoute = require("./routes/register");
const scanRoute = require("./routes/scan");
const medicalRecordRoute = require("./routes/medicalRecord");
const login = require("./routes/login");

// Use routes
app.use("/register", registerRoute);
app.use("/scan", scanRoute);
app.use("/medicalRecord", medicalRecordRoute);
app.use("/login", login);

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  // DB connection
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
