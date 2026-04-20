require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const { connectSupabase } = require("./config/supabase.js"); 
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
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// Routes
const registerRoute = require("./routes/register");
const scanRoute = require("./routes/scan");
const medicalRecordRoute = require("./routes/medicalRecord");
const login = require("./routes/login");
const uploadRoute = require("./routes/upload");

app.use("/register", registerRoute);
app.use("/scan", scanRoute);
app.use("/medicalRecord", medicalRecordRoute);
app.use("/login", login);
app.use("/upload", uploadRoute);

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  connectDB();
  connectSupabase(); // ✅ AJOUT
  console.log(`Server running on port ${PORT}`);
});