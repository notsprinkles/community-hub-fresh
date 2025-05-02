const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokenBalance: { type: Number, default: 100 },
  lastClaimed: { type: Date } // ← add this
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
