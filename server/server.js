const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
  "https://community-hub-fresh.vercel.app",
  "https://community-hub-fresh-git-main-sprinkles1113s-projects.vercel.app",
  "https://community-hub-fresh-14zrje6yo-sprinkles1113s-projects.vercel.app" // <== Add this!
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Handle preflight requests

// === Middleware ===
app.use(express.json());

// === Routes ===
const userRoutes = require("./routes/userRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

app.use("/api/users", userRoutes);
app.use("/api/proposals", proposalRoutes);

// === Root Health Check ===
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// === Connect to MongoDB ===
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

