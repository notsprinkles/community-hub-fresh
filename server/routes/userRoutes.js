const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      tokenBalance: user.tokenBalance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      tokenBalance: user.tokenBalance,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const auth = require("../middleware/auth");

router.post("/earn", auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const now = new Date();
      const lastClaim = user.lastClaimed || new Date(0); // fallback to Jan 1970
      const hoursSince = (now - lastClaim) / (1000 * 60 * 60); // in hours
  
      if (hoursSince < 24) {
        const nextClaim = 24 - Math.floor(hoursSince);
        return res.status(400).json({
          message: `You already claimed your reward. Come back in ${nextClaim} hour${nextClaim !== 1 ? "s" : ""}.`
        });
      }
  
      const rewardAmount = 10;
      user.tokenBalance += rewardAmount;
      user.lastClaimed = now;
      await user.save();
  
      res.status(200).json({
        message: `You earned ${rewardAmount} tokens!`,
        tokenBalance: user.tokenBalance
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });  

module.exports = router;
