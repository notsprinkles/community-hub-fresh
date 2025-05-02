const express = require("express");
const Proposal = require("../models/Proposal");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// GET all proposals
router.get("/", async (req, res) => {
  const proposals = await Proposal.find().sort({ createdAt: -1 });
  res.json(proposals);
});

// POST create a proposal
router.post("/", auth, async (req, res) => {
  const { title, description } = req.body;
  const proposal = await Proposal.create({
    title,
    description,
    createdBy: req.user.userId
  });
  res.status(201).json(proposal);
});

// POST vote on a proposal
router.post("/:id/vote", auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const proposal = await Proposal.findById(req.params.id);

  if (proposal.voters.includes(user._id)) {
    return res.status(400).json({ message: "You already voted on this proposal" });
  }

  if (user.tokenBalance < 10) {
    return res.status(400).json({ message: "Not enough tokens to vote" });
  }

  proposal.votes += 1;
  proposal.voters.push(user._id);
  await proposal.save();

  user.tokenBalance -= 10;
  await user.save();

  res.json({ message: "Vote cast successfully", votes: proposal.votes });
});

module.exports = router;
