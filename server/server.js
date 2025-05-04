const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware

const allowedOrigins = [
  "https://community-hub-fresh.vercel.app",
  "https://community-hub-fresh-git-main-sprinkles1113s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from listed origins OR Postman (no origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

app.use("/api/users", userRoutes);
app.use("/api/proposals", proposalRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// MongoDB connection
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
